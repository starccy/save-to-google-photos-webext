
const extStorage = browser.storage.local;

const NECESSARY_KEYS = ["access_token", "expires_in", "start_time"];

async function getAuthData() {
    const { auth_data } = await extStorage.get("auth_data");
    return auth_data;
}

async function setAuthData(authData) {
    return await extStorage.set({auth_data: authData});
}

// return `true` if the access token is expired
async function checkAccessTokenExpiration() {
    const authData = await getAuthData();
    if (!authData) {
        return true;
    }
    if (!NECESSARY_KEYS.every(key => Object.keys(authData).includes(key))) {
        return true;
    }
    const {expires_in, start_time} = authData;
    const current = Date.now();

    return current - start_time > expires_in * 1000;
}