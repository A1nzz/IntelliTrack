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

  // Обновление данных каждые 5 секунд
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
});