// Lets the web app know it is running inside the desktop app (it can hide the "get the app" banner).
const { contextBridge } = require('electron');
contextBridge.exposeInMainWorld('myagentDesktop', { platform: process.platform, version: '1.0.1' });
