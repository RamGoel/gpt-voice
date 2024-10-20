chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("onMessage", request);
  if (request.action === "insertTranscript") {
    const textarea = document.querySelector(
      'div[contenteditable="true"][id="prompt-textarea"]'
    );
    console.log("textarea", textarea);
    if (textarea) {
      textarea.innerHTML = request.transcript;
      textarea.dispatchEvent(new Event("input", { bubbles: true }));

      setTimeout(() => {
        textarea.blur();
        const button = document.querySelector(
          'button[aria-label="Send prompt"]'
        );
        console.log("button", button);
        if (button) {
          button.click();
        }
      }, 100);
    }
  }
});

const insertHintText = () => {
  const textarea = document.querySelector(
    'div[contenteditable="true"][id="prompt-textarea"]'
  );
  if (textarea) {
    const parentElement = textarea.parentElement;
    const hintText = document.createElement("span");
    hintText.setAttribute("id", "listen-hint");
    hintText.textContent = `Press ${
      navigator.platform.indexOf("Mac") > -1 ? "CMD" : "CTRL"
    }+Q to use voice typing`;
    hintText.style.color = "#888";
    hintText.style.fontSize = "0.9em";
    parentElement.insertBefore(hintText, textarea.nextSibling);
  }
};

// Call the function to insert the button
insertHintText();

// Observe DOM changes to re-insert the button if needed
const observer = new MutationObserver(() => {
  const existingButton = document.querySelector('span[id="listen-hint"]');
  if (!existingButton) {
    insertHintText();
  }
});

observer.observe(document.body, { childList: true, subtree: true });

const injectMicrophonePermissionIframe = () => {
  console.log("Injecting microphone permission iframe");
  const iframe = document.createElement("iframe");
  iframe.setAttribute("hidden", "hidden");
  iframe.setAttribute("id", "permissionsIFrame");
  iframe.setAttribute("allow", "microphone");
  iframe.src = chrome.runtime.getURL("scripts/permission.html");
  document.body.appendChild(iframe);
};

injectMicrophonePermissionIframe();
