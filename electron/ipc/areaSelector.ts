import {ipcMain, BrowserWindow} from 'electron'

import {openAreaSelector, closeAreaSelector} from '../windows/areaSelector'
import {SelectedArea} from '../../shared/types/area'


export function registerAreaSelectorIPC(mainWindow: BrowserWindow | null) {
    ipcMain.on('area-selector:open', () => {
        void openAreaSelector()
    })

    ipcMain.handle('area-selector:selected', async (_, area: SelectedArea) => {
        mainWindow?.webContents.send('area-selector:selected', area)
        closeAreaSelector()
    })

    ipcMain.on('area-selector:close', () => {
        closeAreaSelector()
    })
}