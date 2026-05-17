import { contextBridge, ipcRenderer } from 'electron'

type SelectedArea = {
    x: number
    y: number
    width: number
    height: number
}

contextBridge.exposeInMainWorld('electronAPI', {
    openAreaSelector: () => {
        ipcRenderer.invoke('area:open-selector').then(() => {})
    },

    onAreaSelectedOnce: (callback: (area: any) => void) => {
        ipcRenderer.once('area:selected', (_, area) => {
            callback(area)
        })
    },

    sendSelectedArea: (area: SelectedArea) => {
        ipcRenderer.send('area:selected', area)
    },

    closeAreaSelector: () => {
        ipcRenderer.send('area:close')
    },

    getPrinters: () => ipcRenderer.invoke('printer:list'),
    openPrinterSettings: (printerName: string) => ipcRenderer.invoke('printer:openSettings', printerName),
    print: (name: string, width: number, height: number, offsetX: number, offsetY: number, text: string) => ipcRenderer.invoke('printer:print', name, width, height, offsetX, offsetY, text),

    startScreenCapture: () => ipcRenderer.invoke('screen-capture:start'),


    openPreviewWindow: (base64: string) => ipcRenderer.invoke('preview:open', base64),

    showBannerOverlay: () => ipcRenderer.send('banner-overlay:show'),
    hideBannerOverlay: () => ipcRenderer.send('banner-overlay:hide'),
})