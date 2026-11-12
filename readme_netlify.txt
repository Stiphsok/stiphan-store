STIPHAN STORE — NETLIFY ADMIN / APK-ZIP PUBLISH FIX

Deploy:
1) Extract this ZIP.
2) Drag the extracted folder contents (the folder containing index.html) into Netlify Drop.
3) Open /admin.html and enter the Admin PIN (default: 2468).

APK/ZIP flow:
1) In Add / Edit App, enter the app name and details.
2) Choose the APK or ZIP.
3) The upload is stored in IndexedDB and reaches 100%.
4) At 100%, the file is immediately published into the Apps list in this browser; you do NOT need to press Save first to make the uploaded file appear in Apps.
5) Continue editing the app details and press Save / Update App Details when finished.
6) The public Apps view can be opened immediately. A second tab on the same site is synchronized after the local storage update/reload event.

IMPORTANT STATIC-HOSTING LIMIT:
This Drop-ready build stores uploaded APK/ZIP blobs in the browser's IndexedDB. Netlify static hosting does NOT receive these files as server-side site files. Therefore another device/browser will not automatically get the uploaded APK/ZIP. For shared publishing to every visitor, connect the Admin upload to a server-side object storage/backend.
