# MyAgent desktop

Desktop app for MyAgent (Windows installer and Mac disk image). It opens openmyagent.com in its own window, keeps you signed in, shows notifications, lives in the tray / menu bar, and updates itself from this repo's releases.

Download: https://github.com/HovoAlem/myagent-desktop/releases/latest

Build: push a tag like `v1.0.0` (or run the "Build desktop app" workflow). GitHub Actions builds `MyAgent-Setup-x.y.z.exe` and `MyAgent-x.y.z-universal.dmg` and publishes them as a release.

The Mac build is not signed with an Apple Developer ID yet, so the first launch needs right-click > Open; Mac auto-update needs signing to work.
