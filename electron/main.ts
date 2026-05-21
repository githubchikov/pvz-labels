import {app, BrowserWindow} from 'electron';
import './config/env.ts'

import {createMainWindow} from './windows/mainWindow.ts'

import {registerAreaSelectorIPC} from "./ipc/areaSelector";
import {registerPrinterIPC} from './ipc/printer'
import {registerScreenRecognitionIPC} from "./ipc/screenRecognition";
import {registerWorkOverlayIPC} from "./ipc/workOverlay";
import {registerBannerOverlayIPC} from "./ipc/preview";


app.commandLine.appendSwitch('disable-renderer-backgrounding')
app.commandLine.appendSwitch('disable-background-timer-throttling')
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows')

export let mainWindow: BrowserWindow | null = null

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
        mainWindow = null
    }
})

app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        mainWindow = await createMainWindow()
    }
})


app.whenReady().then(async () => {
    registerPrinterIPC()
    registerBannerOverlayIPC()
    registerWorkOverlayIPC()
    registerScreenRecognitionIPC()

    mainWindow = await createMainWindow()

    registerAreaSelectorIPC(mainWindow)
})