import {BrowserWindow} from "electron";
import path from "node:path";
import {MAIN_DIST} from '../config/env.ts'
import {loadRendererRoute} from "../utils/loadRendererRoute.ts";


export async function createMainWindow(): Promise<BrowserWindow> {
    const mainWindow = new BrowserWindow({
        icon: path.join(process.env.VITE_PUBLIC, 'icon.ico'),

        width: 1000,
        height: 589,

        minHeight: 300,
        minWidth: 800,

        resizable: true,
        minimizable: true,
        maximizable: false,
        fullscreenable: false,

        backgroundColor: '#171717',
        autoHideMenuBar: true,

        webPreferences: {
            preload: path.join(MAIN_DIST, 'preload.cjs'),
            sandbox: false,
            backgroundThrottling: false
        }
    })

    await loadRendererRoute(mainWindow, '/')

    return mainWindow
}