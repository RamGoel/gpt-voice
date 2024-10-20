chrome.commands.onCommand.addListener((command) => {
  if (command === "_execute_action") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].url.startsWith("https://chat.openai.com/")) {
        chrome.action.openPopup();
      }
    });
  }
});
