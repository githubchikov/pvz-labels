import {ipcMain} from 'electron'
import { openAreaSelector, closeAreaSelector } from '../windows/areaOverlay'

export function registerIndexIPC(mainWindow: Electron.CrossProcessExports.BrowserWindow | null) {
    ipcMain.handle('area:open-selector', () => {
        openAreaSelector()
    })

    ipcMain.on('area:selected', (_, area) => {
        mainWindow?.webContents.send('area:selected', area)

        setTimeout(() => {
            closeAreaSelector()
        }, 10)
    })

    ipcMain.on('area:close', () => {
        closeAreaSelector()
    })
}