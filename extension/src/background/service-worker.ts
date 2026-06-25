// Background service worker

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.tabs.create({
      url: 'https://my-jobs-tracker.vercel.app/login?installed=true',
    });
  }
});
