let timeSpent = {};
let activeTabId = null;
let activeTimer = null;

chrome.tabs.onActivated.addListener(activeInfo => {
  // Сохраняем ID активной вкладки
  if (activeTabId !== null) {
    stopTimer(activeTabId);
  }

  activeTabId = activeInfo.tabId;

  chrome.tabs.get(activeTabId, tab => {
    const url = new URL(tab.url).hostname;

    if (!timeSpent[url]) {
      timeSpent[url] = 0; // Инициализация времени, если сайт новый
    }

    startTimer(url);
    chrome.storage.local.set({ timeSpent });
  });
});


function startTimer(url) {
  if (activeTimer) return; // Если таймер уже работает, ничего не делаем

  activeTimer = setInterval(() => {
    timeSpent[url] += 1; // Увеличиваем время на 1 секунду
    chrome.storage.local.set({ timeSpent });
  }, 1000);
}

function stopTimer(tabId) {
  if (activeTimer) {
    clearInterval(activeTimer); // Останавливаем текущий таймер
    activeTimer = null; // Сбрасываем таймер
  }

  chrome.tabs.get(tabId, tab => {
    if (tab) {
      const url = new URL(tab.url).hostname;
      if (timeSpent[url] !== undefined) {
        chrome.storage.local.set({ timeSpent });
      }
    }
  });
}

chrome.tabs.onRemoved.addListener(tabId => {
  stopTimer(tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === 'complete') {
      chrome.tabs.get(tabId, tab => {
        const url = new URL(tab.url).hostname;
  
        if (activeTabId === tabId) {
          // Если это активная вкладка, останавливаем предыдущий таймер
          stopTimer(tabId);
          if (!timeSpent[url]) {
            timeSpent[url] = 0; // Инициализация времени для нового сайта
          }
          startTimer(url);
        }
      });
    }
});
