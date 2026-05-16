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

    onAreaSelected: (callback: (area: SelectedArea) => void) => {
        ipcRenderer.removeAllListeners('area:selected')

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
    print: (name: string, width: number, height: number, text: string) => ipcRenderer.invoke('printer:print', name, width, height, text),
    openPrinterSettings: (printerName: string) => ipcRenderer.invoke('printer:openSettings', printerName),

    startScreenCapture: () => ipcRenderer.invoke('screen-capture:start'),


    openPreviewWindow: (base64: string) => ipcRenderer.invoke('preview:open', base64),

    showBannerOverlay: () => ipcRenderer.send('banner-overlay:show'),
    hideBannerOverlay: () => ipcRenderer.send('banner-overlay:hide'),
})