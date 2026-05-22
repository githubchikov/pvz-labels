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

    mainWindow = await createMainWindow()
    mainWindow.on('close', (event) => {

        if (!isQuiting) {
            event.preventDefault()
            mainWindow?.hide()
            notification("Программа работает в фоне")
        }
    })

    tray = new Tray(
        path.join(__dirname, '../public/icon.ico')
    )
    tray.on('click', () => {
        if (mainWindow?.isVisible()) {
            mainWindow.hide()
        } else {
            mainWindow?.show()
        }
    })
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Открыть PVZ Labels',
            click: () => {
                mainWindow?.show()
            }
        }, {
            label: 'Закрыть',
            click: () => {
                app.quit()
            }
        }
    ])
    tray.setToolTip('PVZ Labels')
    tray.setContextMenu(contextMenu)
})

app.setLoginItemSettings({
    openAtLogin: true
})