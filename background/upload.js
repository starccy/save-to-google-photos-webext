/**
 * use Google Photos Library API to upload image.
 * Reference: `https://developers.google.com/photos/library/guides/upload-media`
 */


const CONTENT_TYPE = {
    JSON: "application/json",
    BINARY: "application/octet-stream",
};

class UploadClient {
    static BASE_URL = "https://photoslibrary.googleapis.com/v1";

    constructor(authData) {
        this.authData = authData;
    }

    /**
     * full workflow to upload image to Google Photos
     * @param imageUrl
     * @returns {Promise<any>}
     */
    async uploadImage(imageUrl) {
        const blob = await this.downloadImageToBlob(imageUrl);
        const uploadToken = await this.uploadImageBytes(blob);
        const item = {
            uploadToken,
            filename: this.extractFilenameFromUrl(imageUrl, `image-${Date.now()}.png`),
            description: `origin url: ${imageUrl}`,
        }
        return (await this.createMediaItems([item])).json();
    }

    /**
     * upload image itself to Google Server
     * @param blob {Blob} Image binary data
     * @returns {Promise<string>} upload token
     */
    async uploadImageBytes(blob) {
        const url = `${UploadClient.BASE_URL}/uploads`;
        const response = await fetch(url, {
            method: "POST",
            body: blob,
            headers: this.generateHeaders(CONTENT_TYPE.BINARY, blob.type),
            mode: "cors",
        });
        switch (response.status) {
            case 200:
                return await response.text();
            case 401:
                throw new Error("Authorization failed");
            default:
                const resp = await response.json();
                throw new Error(`Upload failed: ${JSON.stringify(resp)}`);
        }
    }

    /**
     * create media item with upload token
     * @param items {Array<{uploadToken: string, filename: string, description: string|null}>}
     * @returns {Promise<Response>}
     */
    async createMediaItems(items) {
        const url = `${UploadClient.BASE_URL}/mediaItems:batchCreate`;
        const mediaItems = items.map(item => {
            return {
                description: item.description,
                simpleMediaItem: {
                    fileName: item.filename,
                    uploadToken: item.uploadToken,
                }
            }
        });
        return await fetch(url, {
            method: "POST",
            body: JSON.stringify({newMediaItems: mediaItems}),
            headers: this.generateHeaders(CONTENT_TYPE.JSON, null)
        });
    }

    async downloadImageToBlob(imageUrl) {
        const response = await fetch(imageUrl, {
            mode: "cors"
        });
        return await response.blob();
    }

    generateHeaders(contentType, mimeType) {
        let headers = {
            Authorization: `Bearer ${this.authData.access_token}`,
            "Content-Type": contentType,
        }
        if (mimeType) {
            headers = {
                "X-Goog-Upload-Content-Type": mimeType,
                "X-Goog-Upload-Protocol": "raw",
                ...headers,
            }
        }
        return headers;
    }

    extractFilenameFromUrl(urlString, defaultName) {
        const url = new URL(urlString);
        const pathname = url.pathname;
        const filename = pathname.split("/").pop();
        if (!filename && defaultName) {
            return defaultName;
        } else {
            return filename;
        }
    }
}