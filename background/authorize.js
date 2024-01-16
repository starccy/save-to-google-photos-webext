/**
 * Start the Google authorization process.
 * Reference: `https://github.com/mdn/webextensions-examples/blob/faadfca8ddce0c02cc20c3c261c76a9b50073122/google-userinfo/background/authorize.js`
 */

const REDIRECT_URL = browser.identity.getRedirectURL();
const CLIENT_ID = "146103653875-5bnc2o7l57m7qeq3p5p5dqq3mf85k4c3.apps.googleusercontent.com";
const SCOPES = ["https://www.googleapis.com/auth/photoslibrary.appendonly"]

const AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth\
?client_id=${CLIENT_ID}\
&response_type=token\
&redirect_uri=${encodeURIComponent(REDIRECT_URL)}\
&scope=${encodeURIComponent(SCOPES.join(" "))}`;
const VALIDATION_BASE_URL="https://www.googleapis.com/oauth2/v3/tokeninfo";

function extractAuthData(redirectUri) {
    const m = redirectUri.match(/[#?](.*)/);
    if (!m || m.length < 1)
        return null;
    const params = new URLSearchParams(m[1].split("#")[0]);
    const access_token = params.get("access_token");
    const expires_in = params.get("expires_in");
    return {
        access_token,
        expires_in,
        start_time: Date.now(),
    };
}

async function validate(redirectURL) {
    const authData = extractAuthData(redirectURL);
    if (!authData.access_token) {
        throw new Error("Authorization failure.");
    }
    const validationURL = `${VALIDATION_BASE_URL}?access_token=${authData.access_token}`;
    const validationRequest = new Request(validationURL, {
        method: "GET",
    });

    async function checkResponse(response) {
        if (response.status !== 200) {
            throw new Error("Token validation error");
        }
        const json = await response.json();
        if (json.aud && (json.aud === CLIENT_ID)) {
            return authData;
        } else {
            throw new Error("Token validation error");
        }
    }

    return fetch(validationRequest).then(checkResponse);
}

function authorize() {
    return browser.identity.launchWebAuthFlow({
        interactive: true,
        url: AUTH_URL,
    });
}

async function fetchAuthData() {
    if (await checkAccessTokenExpiration()) {
        await authorize().then(validate).then(setAuthData);
    } else {
    }
    return await getAuthData();
}
