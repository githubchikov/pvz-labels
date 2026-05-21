import {BrowserWindow, screen} from 'electron'
import path from 'node:path'
import {loadRendererRoute} from "../utils/loadRendererRoute.ts";
import {MAIN_DIST} from "../config/env.ts";
import {mainWindow} from "../main.ts";


let areaSelectorWindow: BrowserWindow | null = null

export async function openAreaSelector(): Promise<void> {
    if (areaSelectorWindow && !areaSelectorWindow.isDestroyed()) return

    const cursorPoint = screen.getCursorScreenPoint()
    const display = screen.getDisplayNearestPoint(cursorPoint)

    areaSelectorWindow = new BrowserWindow({
        x: display.bounds.x,
        y: display.bounds.y,
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
        hasShadow: false,
        enableLargerThanScreen: true,
        backgroundColor: '#00000000',

        webPreferences: {
            preload: path.join(MAIN_DIST, 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false
        }
    })

    await loadRendererRoute(
        areaSelectorWindow,
        '/area-selector'
    )

    areaSelectorWindow.show()
    areaSelectorWindow.focus()
    areaSelectorWindow.moveTop()

    areaSelectorWindow.on('closed', () => {
        areaSelectorWindow = null
    })

    mainWindow?.once('closed', () => {
        if (
            areaSelectorWindow &&
            !areaSelectorWindow.isDestroyed()
        ) {
            areaSelectorWindow.destroy()
        }

        areaSelectorWindow = null
    })
}

export function closeAreaSelector(): void {
    if (!areaSelectorWindow) return

    if (!areaSelectorWindow.isDestroyed()) {
        areaSelectorWindow.destroy()
    }

    areaSelectorWindow = null
}