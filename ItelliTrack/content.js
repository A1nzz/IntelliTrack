// Проверка заблокированных сайтов из локального хранилища
chrome.storage.local.get(['allowedSites', 'blockedSites'], (result) => {
    const allowedSites = result.allowedSites || [];
    const blockedSites = result.blockedSites || [];
    const currentUrl = window.location.hostname;

    if (allowedSites.length === 0) {
        return; // Ничего не делаем, если не выбрана категория
      }
  
    // Проверка, заблокирован ли текущий сайт
    if (blockedSites.some(site => currentUrl === site) || !allowedSites.includes(currentUrl)) {
      // Замена содержимого страницы
      document.body.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh; text-align: center;">
          <h1>Доступ к этому сайту заблокирован</h1>
        </div>
      `;
    }
  });