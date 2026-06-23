// Background service worker

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.tabs.create({
      url: 'http://localhost:5173/login?installed=true',
    });
  }
});
