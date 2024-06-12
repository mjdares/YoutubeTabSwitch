// Function to inject content script
function injectContentScript(tabId, callback) {
	chrome.scripting.executeScript(
		{
			target: { tabId: tabId },
			files: ['content.js']
		},
		callback
	);
}

// Listen for tab activation events
chrome.tabs.onActivated.addListener((activeInfo) => {
	chrome.tabs.get(activeInfo.tabId, (tab) => {
		if (tab.url && tab.url.includes("youtube.com/watch")) {
			injectContentScript(activeInfo.tabId, () => {
				chrome.tabs.sendMessage(activeInfo.tabId, { action: "resumeVideo" });
			});
		}
	});
});

// Listen for tab update events
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.status === 'complete' && tab.url && tab.url.includes("youtube.com/watch")) {
		injectContentScript(tabId, () => {
			chrome.tabs.sendMessage(tabId, { action: "resumeVideo" });
		});
	}
});

// Listen for tab deactivation events
chrome.tabs.onActivated.addListener((activeInfo) => {
	chrome.tabs.query({ active: false, currentWindow: true }, (tabs) => {
		tabs.forEach((tab) => {
			if (tab.url && tab.url.includes("youtube.com/watch")) {
				chrome.tabs.sendMessage(tab.id, { action: "pauseVideo" });
			}
		});
	});
});

// Listen for window focus change events
chrome.windows.onFocusChanged.addListener((windowId) => {
	chrome.windows.getAll({ populate: true }, (windows) => {
		windows.forEach((window) => {
			window.tabs.forEach((tab) => {
				if (tab.url && tab.url.includes("youtube.com/watch")) {
					if (windowId === chrome.windows.WINDOW_ID_NONE) {
						chrome.tabs.sendMessage(tab.id, { action: "pauseVideo" });
					} else {
						chrome.tabs.sendMessage(tab.id, { action: "resumeVideo" });
					}
				}
			});
		});
	});
});
