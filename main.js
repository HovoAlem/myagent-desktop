// MyAgent desktop: a native window for openmyagent.com with sign-in kept, notifications, tray icon and auto-update.
const { app, BrowserWindow, Tray, Menu, shell, nativeImage, session, Notification } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

const HOME = 'https://openmyagent.com/';
let win = null, tray = null, quitting = false;

if (!app.requestSingleInstanceLock()) { app.quit(); }
app.on('second-instance', () => show());
app.setAppUserModelId('com.openmyagent.desktop'); // Windows notifications show "MyAgent"

function show() { if (!win) return create(); if (win.isMinimized()) win.restore(); win.show(); win.focus(); }

function create() {
  win = new BrowserWindow({
    width: 1280, height: 840, minWidth: 380, minHeight: 560, title: 'MyAgent', backgroundColor: '#ffffff',
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.js'), partition: 'persist:myagent', contextIsolation: true, sandbox: true, spellcheck: true },
  });
  win.loadURL(HOME);
  // links to other sites open in the normal browser; MyAgent pages stay in the app
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith(HOME) || url.startsWith('blob:')) return { action: 'allow' };
    shell.openExternal(url); return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith(HOME)) { e.preventDefault(); shell.openExternal(url); } });
  win.on('page-title-updated', (e, t) => { const m = /^\((\d+)\)/.exec(t || ''); const n = m ? +m[1] : 0; if (process.platform === 'darwin') app.dock.setBadge(n ? String(n) : ''); else app.setBadgeCount(n); });
  // closing the window keeps MyAgent running in the tray so notifications still arrive
  win.on('close', e => { if (!quitting) { e.preventDefault(); win.hide(); } });
}

function makeTray() {
  const img = nativeImage.createFromPath(path.join(__dirname, 'build', 'tray.png')).resize({ width: 18, height: 18 });
  tray = new Tray(img); tray.setToolTip('MyAgent');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Open MyAgent', click: show },
    { label: 'Check for Updates', click: () => autoUpdater.checkForUpdatesAndNotify().catch(() => {}) },
    { type: 'separator' },
    { label: 'Quit MyAgent', click: () => { quitting = true; app.quit(); } },
  ]));
  tray.on('click', show);
}

app.whenReady().then(() => {
  const ses = session.fromPartition('persist:myagent');
  ses.setPermissionRequestHandler((wc, perm, cb) => cb(['notifications', 'media', 'clipboard-read', 'clipboard-sanitized-write', 'fullscreen'].includes(perm)));
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    ...(process.platform === 'darwin' ? [{ role: 'appMenu' }] : []),
    { role: 'editMenu' },
    { label: 'View', submenu: [{ role: 'reload' }, { role: 'forceReload' }, { type: 'separator' }, { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }, { type: 'separator' }, { role: 'togglefullscreen' }] },
    { role: 'windowMenu' },
  ]));
  create(); makeTray();
  autoUpdater.autoDownload = true;
  autoUpdater.on('update-downloaded', () => {
    if (Notification.isSupported()) new Notification({ title: 'MyAgent update ready', body: 'It will install when you quit MyAgent.' }).show();
  });
  autoUpdater.checkForUpdatesAndNotify().catch(() => {});
  setInterval(() => autoUpdater.checkForUpdatesAndNotify().catch(() => {}), 4 * 60 * 60 * 1000);
});
app.on('activate', show);
app.on('before-quit', () => { quitting = true; });
