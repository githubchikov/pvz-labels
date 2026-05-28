import {
    app,
    BrowserWindow,
    Tray,
    Menu
} from 'electron'
import './config/env.ts'
import path from 'node:path'

import {registerPrinterIPC} from './ipc/printer'

import {createMainWindow} from './windows/mainWindow.ts'
import {startWSServer} from './services/wsServer'
import {notification} from './services/notification.ts'


app.commandLine.appendSwitch('disable-renderer-backgrounding')
app.commandLine.appendSwitch('disable-background-timer-throttling')
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows')

export let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let isQuiting = false


function bringAppToFront() {
    if (!mainWindow) return

    mainWindow.show()

    if (mainWindow.isMinimized()) {
        mainWindow.restore()
    }

    mainWindow.focus()
    mainWindow.setSkipTaskbar(false)
}

const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
    app.exit()
} else {
    app.on('second-instance', () => {
        bringAppToFront()
        notification('Приложение уже запущено — открываю текущее окно')
    })
}


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

app.on('before-quit', () => {
    isQuiting = true
})

app.setAppUserModelId('PVZ Labels')

app.whenReady().then(async () => {
    registerPrinterIPC()
    startWSServer()

    tray = new Tray(path.join(process.env.VITE_PUBLIC, 'icon.ico'))
    tray.setToolTip('PVZ Labels')

    tray.setContextMenu(Menu.buildFromTemplate([
        {
            label: 'Открыть PVZ Labels',
            click: () => mainWindow?.show()
        }, {
            label: 'Закрыть',
            click: () => app.quit()
        }
    ]))

    tray.on('click', () => {
        if (mainWindow?.isVisible()) {
            mainWindow.hide()
        } else {
            mainWindow?.show()
        }
    })

    mainWindow = await createMainWindow()

    mainWindow.on('close', (event) => {
        if (!isQuiting) {
            event.preventDefault()
            mainWindow?.hide()
            notification("Программа работает в фоне")
        }
    })
})

if (app.isPackaged) {
    app.setLoginItemSettings({
        openAtLogin: true,
        path: process.execPath
    })
}