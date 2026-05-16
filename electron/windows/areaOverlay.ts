import { BrowserWindow, screen } from 'electron'
import path from 'node:path'
import { MAIN_DIST, RENDERER_DIST, VITE_DEV_SERVER_URL } from '../main'

let overlayWindow: BrowserWindow | null = null

export function openAreaSelector() {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
        return
    }

    const display = screen.getPrimaryDisplay()

    overlayWindow = new BrowserWindow({
        x: 0,
        y: 0,
        width: display.bounds.width,
        height: display.bounds.height,

        transparent: true,
        frame: false,
        fullscreen: true,
        alwaysOnTop: true,
        skipTaskbar: true,
        movable: false,
        resizable: false,
        focusable: true,
        backgroundColor: '#00000000',

        webPreferences: {
            preload: path.join(MAIN_DIST, 'preload.mjs'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false
        }
    })

    if (VITE_DEV_SERVER_URL) {
        overlayWindow.loadURL(`${VITE_DEV_SERVER_URL}/#/area-selector`)
    } else {
        overlayWindow.loadFile(
            path.join(RENDERER_DIST, 'index.html'),
            {
                hash: '/area-selector'
            }
        )
    }

    overlayWindow.focus()

    overlayWindow.on('closed', () => {
        overlayWindow = null
    })
}

export function closeAreaSelector() {
    if (!overlayWindow) return

    if (!overlayWindow.isDestroyed()) {
        overlayWindow.destroy()
    }

    overlayWindow = null
}