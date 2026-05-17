import { app, BrowserWindow, ipcMain, desktopCapturer } from 'electron';
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

import { registerPrinterIPC } from './ipc/printer'
import { registerIndexIPC } from "./ipc";

import {
    createBannerOverlayWindow,
    hideBannerOverlay
} from './windows/bannerOverlay'

app.commandLine.appendSwitch('disable-renderer-backgrounding')
app.commandLine.appendSwitch('disable-background-timer-throttling')
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows')

createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
    win = new BrowserWindow({
        icon: path.join(process.env.VITE_PUBLIC, 'icon.ico'),

        width: 500,
        height: 800,

        minHeight: 400,
        maxHeight: 1000,
        minWidth: 516,
        maxWidth: 516,

        resizable: true,
        minimizable: true,
        maximizable: false,
        fullscreenable: false,

        backgroundColor: '#222222',
        // autoHideMenuBar: true,

        webPreferences: {
            preload: path.join(__dirname, 'preload.mjs'),
            sandbox: false,
            backgroundThrottling: false
        }
    })

    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL)
    } else {
        win.loadFile(path.join(RENDERER_DIST, 'index.html'))
    }
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
        win = null
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

ipcMain.handle('screen-capture:start', async () => {
    try {
        const sources = await desktopCapturer.getSources({
            types: ['screen'],
            thumbnailSize: { width: 1920, height: 1080 }
        });

        if (sources.length > 0) {
            return { sourceId: sources[0].id };
        }
        throw new Error('No screens found');
    } catch (error) {
        console.error('[Main] Screen capture error:', error);
        throw error;
    }
});


let previewWindow: BrowserWindow | null = null
ipcMain.handle('preview:open', async (_, base64) => {
    if (!previewWindow || previewWindow.isDestroyed()) {
        previewWindow = new BrowserWindow({
            width: 800,
            height: 600,
            autoHideMenuBar: true,
            backgroundColor: '#222222',

            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        })

        const html = `
            <html lang="ru">
                <head>
                    <title>PVZ Labels - Предпросмотр</title>
                </head>
                <body style="
                    margin: 0;
                    background: #222222;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                ">
                    <canvas id="preview"></canvas>
                    <script>
                        const { ipcRenderer } = require('electron');
            
                        const canvas = document.getElementById('preview');
                        const ctx = canvas.getContext('2d');
            
                        ipcRenderer.on('preview:update', (_, base64) => {
                            const img = new Image();
                            img.onload = () => {
                                canvas.width = img.width;
                                canvas.height = img.height;
            
                                ctx.clearRect(0, 0, canvas.width, canvas.height);
                                ctx.drawImage(img, 0, 0);
                            };
                            img.src = base64;
                        });
                    </script>
                </body>
            </html>
        `;
        await previewWindow.loadURL(
            'data:text/html;charset=utf-8,' + encodeURIComponent(html)
        );
    }

    previewWindow.focus()
    previewWindow.webContents.send('preview:update', base64)
})

ipcMain.on('banner-overlay:show', () => {
    createBannerOverlayWindow()
})

ipcMain.on('banner-overlay:hide', () => {
    hideBannerOverlay()
})


app.whenReady().then(() => {
    createWindow()
    registerPrinterIPC(win)
    registerIndexIPC(win)
})