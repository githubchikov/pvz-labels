import {ipcMain} from 'electron'
import {createWorkOverlayWindow, hideWorkOverlayWindow} from "../windows/workOverlay.ts";
import {SelectedArea} from "../../shared/types/area.ts";
import {ocrHudWindow} from '../windows/workOverlay'
import {mainWindow} from "../main.ts";
import {currentArea} from '../windows/workOverlay.ts'


export function registerWorkOverlayIPC() {
    ipcMain.handle('work-overlay:show', (_, area: SelectedArea) => {
        void createWorkOverlayWindow(area)
    })

    ipcMain.on('work-overlay:hide', () => {
        hideWorkOverlayWindow()
    })

    ipcMain.on('work-overlay:update-text', (_, text) => {
        if (!ocrHudWindow || ocrHudWindow.isDestroyed()) {
            console.log('[IPC][WORK_OVERLAY] Window not available');
            return;
        }
        ocrHudWindow.webContents.send("work-overlay:update-text", text);
    })

    ipcMain.on('work-overlay:stop-recognition', () => {
        mainWindow?.webContents.send('work-overlay:stop-recognition');
        hideWorkOverlayWindow();
    })

    ipcMain.handle('work-overlay:get-area', () => {
        return currentArea
    })
}