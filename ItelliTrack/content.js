// Проверка заблокированных сайтов из локального хранилища
chrome.storage.local.get(['blockedSites'], (result) => {
    const blockedSites = result.blockedSites || [];
    const currentUrl = window.location.hostname;
  
    // Проверка, заблокирован ли текущий сайт
    if (blockedSites.some(site => currentUrl === site)) {
      // Замена содержимого страницы
      document.body.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh; text-align: center;">
          <h1>Доступ к этому сайту заблокирован</h1>
        </div>
      `;
    }
  });