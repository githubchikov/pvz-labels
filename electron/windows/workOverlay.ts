import { BrowserWindow, screen } from 'electron'
import {loadRendererRoute} from "../utils/loadRendererRoute.ts";
import {SelectedArea} from "../../shared/types/area.ts";
import {MAIN_DIST} from "../config/env.ts";
import path from "node:path";

import {mainWindow} from '../main.ts'


export let ocrHudWindow: BrowserWindow | null = null
// export let captureOverlayWindow: BrowserWindow | null = null
export let currentArea: SelectedArea | null = null

export async function createWorkOverlayWindow(area: SelectedArea) {
    if (ocrHudWindow && !ocrHudWindow.isDestroyed()) {
        ocrHudWindow.destroy()
    }

    // if (captureOverlayWindow && !captureOverlayWindow.isDestroyed()) {
    //     captureOverlayWindow.destroy()
    // }

    currentArea = area

    const display = screen.getPrimaryDisplay()
    const x = Math.round(
        display.workArea.x +
        (display.workArea.width - 656) / 2
    )

    ocrHudWindow = new BrowserWindow({
        width: 656 - 43,
        height: 154,
        x: x,
        y: 40,

        frame: false,
        transparent: true,
        resizable: false,
        hasShadow: false,
        alwaysOnTop: true,
        autoHideMenuBar: true,

        backgroundColor: '#00000000',

        webPreferences: {
            preload: path.join(MAIN_DIST, 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration: false
        }
    })

    // captureOverlayWindow = new BrowserWindow({
    //     // width: area.width + 4 - 43,
    //     // height: area.height + 4 + 27,
    //     width: area.width,
    //     height: area.height,
    //     x: area.x,
    //     y: area.y,
    //
    //     frame: false,
    //     transparent: true,
    //     movable: false,
    //     resizable: false,
    //     focusable: false,
    //     hasShadow: false,
    //     alwaysOnTop: true,
    //     skipTaskbar: true,
    //     autoHideMenuBar: true,
    //
    //     backgroundColor: '#00000000',
    //
    //     webPreferences: {
    //         preload: path.join(MAIN_DIST, 'preload.cjs'),
    //         contextIsolation: true,
    //         nodeIntegration: false
    //     }
    // })

    await loadRendererRoute(
        ocrHudWindow,
        '/work-overlay-ocr-hud'
    )
    // await loadRendererRoute(
    //     captureOverlayWindow,
    //     '/work-overlay-capture'
    // )

    ocrHudWindow.once('ready-to-show', () => {
        ocrHudWindow?.show()
        ocrHudWindow?.setAlwaysOnTop(true, 'screen-saver')
    })

    // captureOverlayWindow.once('ready-to-show', () => {
    //     captureOverlayWindow?.show()
    //     captureOverlayWindow?.setAlwaysOnTop(true, 'screen-saver')
    // })

    ocrHudWindow.on('closed', () => {
        ocrHudWindow = null
    })
    // captureOverlayWindow.on('closed', () => {
    //     captureOverlayWindow = null
    // })

    mainWindow?.once('closed', () => {
        if (
            ocrHudWindow &&
            !ocrHudWindow.isDestroyed()
        ) {
            ocrHudWindow.destroy()
        }

        // if (
        //     captureOverlayWindow &&
        //     !captureOverlayWindow.isDestroyed()
        // ) {
        //     captureOverlayWindow.destroy()
        // }

        ocrHudWindow = null
        // captureOverlayWindow = null
    })
}

export function hideWorkOverlayWindow() {
    if (!ocrHudWindow) return
    //  || !captureOverlayWindow

    if (ocrHudWindow && !ocrHudWindow.isDestroyed()) {
        ocrHudWindow.close()
    }

    // if (captureOverlayWindow && !captureOverlayWindow.isDestroyed()) {
    //     captureOverlayWindow.close()
    // }

    ocrHudWindow = null
    // captureOverlayWindow = null
}