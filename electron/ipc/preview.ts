import {ipcMain} from 'electron'

import {createPreviewWindow} from "../windows/previewAreaWindow.ts";


export function registerBannerOverlayIPC() {
    ipcMain.handle('preview:open', async (_, base64: string) => {
        createPreviewWindow(base64)
    })
}