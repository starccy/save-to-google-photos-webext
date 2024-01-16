const ELEMENT_ID_TOAST = "save-to-google-photos-toast";

function showToastMessage(html, duration) {
    const toast = createToastNode(html);
    document.body.appendChild(toast);
    toast.className = "show";
    setTimeout(() => {
        toast.className = "";
        toast.remove();
    }, duration);
}

function createToastNode(html, duration) {
    const toast = document.createElement('div');
    toast.id = ELEMENT_ID_TOAST;
    toast.innerHTML = html;
    toast.style.animation = `fadein 0.5s, fadeout 0.5s ${duration}ms`;
    return toast;
}

function msgReceiver(msg, sender, sendResponse) {
    console.info("[SaveToGooglePhotos] show-toast", msg);
    switch (msg.type) {
        case "show-toast":
            showToastMessage(msg.showToast.html, msg.showToast.duration);
            return Promise.resolve(true);
    }
    return false;
}

browser.runtime.onMessage.addListener(msgReceiver)