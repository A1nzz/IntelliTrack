document.addEventListener('DOMContentLoaded', () => {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabs = document.querySelectorAll('.tab');
  const siteList = document.getElementById('siteList');

  // Объект для хранения времени, проведенного на сайтах
  let timeSpent = {};

  // Загрузка данных из локального хранилища
  function loadTimeSpent() {
    chrome.storage.local.get('timeSpent', data => {
      timeSpent = data.timeSpent || {};
      updateSiteList();
    });
  }

  function updateSiteList() {
    siteList.innerHTML = ''; // Очистка списка
    for (const [url, seconds] of Object.entries(timeSpent)) {
      const listItem = document.createElement('li');
      listItem.className = 'site-item'; // Добавление класса для стилей
  
      // Создание элемента изображения для favicon
      const favicon = document.createElement('img');
      favicon.src = `https://www.google.com/s2/favicons?sz=64&domain=${url}`; // Получение favicon
      favicon.onerror = () => { favicon.src = 'default-icon.png'; }; // Замена на иконку по умолчанию при ошибке
  
      // Текст элемента списка
      const textNode = document.createTextNode(`${url}: ${Math.floor(seconds / 60)}m ${seconds % 60}s`);
  
      // Добавление элементов в список
      listItem.appendChild(favicon);
      listItem.appendChild(textNode);
      siteList.appendChild(listItem);
    }
  }

  setInterval(loadTimeSpent, 1000);

  // Логика переключения вкладок
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');

      // Скрыть все вкладки
      tabs.forEach(tab => {
        tab.classList.remove('active');
      });

      // Показать выбранную вкладку
      document.getElementById(targetTab).classList.add('active');

      // Снять активный класс со всех кнопок
      tabButtons.forEach(btn => {
        btn.classList.remove('active');
      });

      // Добавить активный класс к нажатой кнопке
      button.classList.add('active');
    });
  });


  // Модальное окно
  const modal = document.getElementById("modal");
  const closeModal = document.getElementById("closeModal");
  const saveSiteButton = document.getElementById("saveSite");
  let currentCategoryId = null;

  // Обработчик для кнопок добавления сайтов
  document.querySelectorAll('.add-site-button').forEach(button => {
    button.addEventListener('click', () => {
      currentCategoryId = button.getAttribute('data-category');
      modal.style.display = "block";
    });
  });

  closeModal.onclick = () => {
    modal.style.display = "none"; // Закрываем модальное окно
  };

  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = "none"; // Закрываем при клике вне окна
    }
  };

  saveSiteButton.onclick = () => {
    const url = document.getElementById("siteUrl").value.trim(); // Убираем пробелы
    const urlPattern = /^(ftp|http|https):\/\/(www\.)?[\w-]+\.[a-z]{2,}\/?([^ "]*)$/; 
    const domain = new URL(url).hostname; // Получаем домен


    if (domain && urlPattern.test(url)) { // Проверка на пустоту и корректный URL
        const list = document.getElementById(currentCategoryId);
        const listItem = document.createElement('li');

        // Создаем элемент для URL
        const siteText = document.createTextNode(domain);
        listItem.appendChild(siteText);

        // Создаем кнопку удаления
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '🗑️'; // Иконка корзины
        deleteButton.className = 'delete-button';

        // Обработчик события для удаления сайта
        deleteButton.onclick = () => {
            list.removeChild(listItem); // Удаляем элемент из списка
            removeSiteFromStorage(currentCategoryId, domain); // Удаляем сайт из chrome.storage
        };

        listItem.appendChild(deleteButton); // Добавляем кнопку удаления к элементу списка
        list.appendChild(listItem); // Добавляем элемент списка к списку

        // Сохранение сайта в chrome.storage
        chrome.storage.local.get(['categories'], (result) => {
            const categories = result.categories || {};
            if (!categories[currentCategoryId]) {
                categories[currentCategoryId] = [];
            }
            categories[currentCategoryId].push(domain);
            chrome.storage.local.set({ categories });
        });

        document.getElementById("siteUrl").value = ''; // Очищаем поле ввода
        modal.style.display = "none"; // Закрываем модальное окно
    } else {
        alert("Пожалуйста, введите корректный URL сайта."); // Сообщение об ошибке
    }
  };

  function removeSiteFromStorage(categoryId, url) {
    chrome.storage.local.get(['categories'], (result) => {
      const categories = result.categories || {};
      if (categories[categoryId]) {
        categories[categoryId] = categories[categoryId].filter(site => site !== url);
        chrome.storage.local.set({ categories });
      }
    });
  }
  
  function loadSites() {
    chrome.storage.local.get(['categories'], (result) => {
      const categories = result.categories || {};
      for (const [categoryId, sites] of Object.entries(categories)) {
        const list = document.getElementById(categoryId);
        sites.forEach(site => {
          const listItem = document.createElement('li');
          listItem.textContent = site;
  
          // Создаем кнопку удаления
          const deleteButton = document.createElement('button');
          deleteButton.innerHTML = '🗑️'; // Иконка корзины
          deleteButton.className = 'delete-button';
  
          // Обработчик события для удаления сайта
          deleteButton.onclick = () => {
            list.removeChild(listItem); // Удаляем элемент из списка
            removeSiteFromStorage(categoryId, site); // Удаляем сайт из chrome.storage
          };
  
          listItem.appendChild(deleteButton); // Добавляем кнопку удаления к элементу списка
          list.appendChild(listItem); // Добавляем элемент списка к списку
        });
      }
    });
  }

  loadSites(); // Загружаем сайты при открытии страницы


  const blockedList = document.getElementById('blockedList');
  const blockSiteButton = document.getElementById('blockSiteButton');

  function loadBlockedSites() {
    chrome.storage.local.get(['blockedSites'], (result) => {
      const blockedSites = result.blockedSites || [];
      blockedList.innerHTML = ''; // Очистка списка

      blockedSites.forEach(site => {
        const listItem = document.createElement('li');
        listItem.textContent = site;

        // Создаем кнопку удаления
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '🗑️'; // Иконка корзины
        deleteButton.className = 'delete-button';

        // Обработчик события для удаления сайта
        deleteButton.onclick = () => {
          blockedList.removeChild(listItem); // Удаляем элемент из списка
          removeBlockedSite(site); // Удаляем сайт из chrome.storage
        };

        listItem.appendChild(deleteButton); // Добавляем кнопку удаления к элементу списка
        blockedList.appendChild(listItem); // Добавляем элемент списка к списку
      });
    });
  }

  function removeBlockedSite(url) {
    chrome.storage.local.get(['blockedSites'], (result) => {
      const blockedSites = result.blockedSites || [];
      const updatedSites = blockedSites.filter(site => site !== url);
      chrome.storage.local.set({ blockedSites: updatedSites });
      loadBlockedSites(); // Перезагружаем список
    });
  }

  blockSiteButton.onclick = () => {
    const url = document.getElementById("blockSiteUrl").value.trim(); // Убираем пробелы
    const urlPattern = /^(ftp|http|https):\/\/(www\.)?[\w-]+\.[a-z]{2,}\/?([^ "]*)$/; 
    const domain = new URL(url).hostname; // Получаем домен

    if (domain && urlPattern.test(url)) { // Проверка на пустоту и корректный URL
      const listItem = document.createElement('li');
      listItem.textContent = domain;

      // Создаем кнопку удаления
      const deleteButton = document.createElement('button');
      deleteButton.innerHTML = '🗑️'; // Иконка корзины
      deleteButton.className = 'delete-button';

      // Обработчик события для удаления сайта
      deleteButton.onclick = () => {
        blockedList.removeChild(listItem); // Удаляем элемент из списка
        removeBlockedSite(domain); // Удаляем сайт из chrome.storage
      };

      listItem.appendChild(deleteButton); // Добавляем кнопку удаления к элементу списка
      blockedList.appendChild(listItem); // Добавляем элемент списка к списку

      // Сохранение заблокированного сайта в chrome.storage
      chrome.storage.local.get(['blockedSites'], (result) => {
        const blockedSites = result.blockedSites || [];
        blockedSites.push(domain);
        chrome.storage.local.set({ blockedSites });
      });

      document.getElementById("blockSiteUrl").value = ''; // Очищаем поле ввода
    } else {
      alert("Пожалуйста, введите корректный URL сайта."); // Сообщение об ошибке
    }
    
  };
  loadBlockedSites(); // Загружаем заблокированные сайты при открытии страницы
});