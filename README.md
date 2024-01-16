save-to-google-photos

This is a Firefox extension that allows you to save images to Google Photos by 
one click in the context menu.

## How to use

1. Install the extension from `change me to a real link latter`.
2. Right-click on an image and select `Save to Google Photos`.
3. Finish Google OAuth2 authentication in the popup window.

## Caveats

this is a very early version, so there are many things to improve.

Currently, the Google access token won't be refreshed automatically, it will
expire after 1 hour. So you need to re-authenticate then.

## TODO


- [ ] Keep and refresh the Google Photos library API access token once it expires.
- [ ] Better error handling and error messages for the user.
- [ ] Maybe add an option page to configure the description for uploaded images and so on.