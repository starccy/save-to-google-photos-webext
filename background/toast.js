const TOAST_CSS_FILE = "toast.css";

async function showToastMessage(tabId, html, duration) {
    await applyToastCss(tabId);
    await browser.tabs.sendMessage(tabId, {
        type: "show-toast",
        showToast: {
            html,
            duration,
        }
    })
}

async function applyToastCss(tabId) {
    await browser.scripting.insertCSS({
        target: {
            tabId,
        },
        files: [TOAST_CSS_FILE],
    });
}