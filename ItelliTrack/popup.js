document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabs = document.querySelectorAll('.tab');
  
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