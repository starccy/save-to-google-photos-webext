
const MENU_SAVE_PHOTO_ID = "save-to-google-photos";

browser.contextMenus.create({
        id: MENU_SAVE_PHOTO_ID,
        title: "Save image to Google Photos",
        contexts: ["image"]
    },
    () => void browser.runtime.lastError
);

browser.contextMenus.onClicked.addListener(async (menuData, tab) => {
    if (menuData.menuItemId === MENU_SAVE_PHOTO_ID) {
        await injectToastScript(tab.id);
        await onSavePhotoMenuClick(menuData, tab.id);
    }
});

async function onSavePhotoMenuClick(menuData, tabId) {
    try {
        await doSavePhoto(menuData, tabId);
    } catch (err) {
        console.error("[SaveToGooglePhotos] error: ", err);
        const htmlMessage = `❌ Save failed: ${err.message}`;
        await showToastMessage(tabId, htmlMessage, 3000);
    }
}

async function doSavePhoto(menuData, tabId) {
    const imageUrl = menuData.srcUrl;
    console.info("[SaveToGooglePhotos] origin image url: ", imageUrl);
    const authData = await fetchAuthData(imageUrl);
    const uploadClient = new UploadClient(authData);
    const uploadResult = await uploadClient.uploadImage(imageUrl);

    console.info("[SaveToGooglePhotos] upload Result: ", uploadResult);
    const htmlMessage = createToastMessage(uploadResult);
    await showToastMessage(tabId, htmlMessage, 3000);
}

function createToastMessage(uploadResult) {
    if (uploadResult.newMediaItemResults.length !== 0) {
        const item = uploadResult.newMediaItemResults[0];
        const url = item.mediaItem.productUrl;
        const filename = item.mediaItem.filename;
        return `✅ Save as <a href="${url}" target="_blank">${filename}</a>`;
    } else {
        return "❌ Save failed";
    }
}

async function injectToastScript(tabId) {
    await browser.scripting.executeScript({
        target: {
            tabId,
        },
        files: ["content_scripts/toast.js"],
    });
}