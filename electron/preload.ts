import {contextBridge, ipcRenderer} from 'electron'
import {LabelConfig} from "./types/printer.ts";


contextBridge.exposeInMainWorld('electronAPI', {
    getPrinters: () => ipcRenderer.invoke('printer:list'),

    openPrinterSettings: (printerName: string) => ipcRenderer.invoke('printer:openSettings', printerName),

    print: (
        name: string,
        label: LabelConfig,
        text: string
    ) => ipcRenderer.invoke('printer:print', name, label, text),

    updatePrinterConfig: (
        printerName: string,
        label: LabelConfig
    ) =>
        ipcRenderer.invoke(
            'printer:update-config',
            {
                printerName,
                label
            }
        )
})