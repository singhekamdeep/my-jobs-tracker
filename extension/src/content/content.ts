// Content script: runs on every page, listens for SCRAPE_JOB messages

chrome.runtime.onMessage.addListener(
  (
    message: { type: string },
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: unknown) => void
  ) => {
    if (message.type === 'SCRAPE_JOB') {
      try {
        const title = document.title || '';
        const url = window.location.href;

        // Extract OG tags
        const ogTitleEl = document.querySelector(
          'meta[property="og:title"]'
        ) as HTMLMetaElement | null;
        const ogDescEl = document.querySelector(
          'meta[property="og:description"]'
        ) as HTMLMetaElement | null;

        const ogTitle = ogTitleEl?.content || '';
        const ogDescription = ogDescEl?.content || '';

        // Extract body text (trimmed to 8000 chars)
        const bodyText = (document.body.innerText || '').trim().substring(0, 8000);

        sendResponse({
          success: true,
          data: {
            title,
            url,
            ogTitle,
            ogDescription,
            bodyText,
          },
        });
      } catch (err) {
        sendResponse({
          success: false,
          error: err instanceof Error ? err.message : 'Failed to scrape page',
        });
      }
    }

    // Return true to indicate we will respond asynchronously
    return true;
  }
);
