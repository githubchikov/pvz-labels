import { contextBridge, ipcRenderer } from 'electron'
import { SelectedArea } from "../shared/types/area";
import {LabelConfig} from "./types/printer.ts";


contextBridge.exposeInMainWorld('electronAPI', {
    openAreaSelector: () => {
        ipcRenderer.send('area-selector:open')
    },

    closeAreaSelector: () => {
        ipcRenderer.send('area-selector:close')
    },

    sendSelectedArea: (area: SelectedArea) => {
        void ipcRenderer.invoke('area-selector:selected', area)
    },

    onAreaSelected: (callback: (area: SelectedArea) => void) => {
        ipcRenderer.removeAllListeners('area-selector:selected')
        ipcRenderer.once('area-selector:selected', (_, area: SelectedArea) => {
            callback(area)
        })
    },


    getPrinters: () => ipcRenderer.invoke('printer:list'),

    openPrinterSettings: (printerName: string) => ipcRenderer.invoke('printer:openSettings', printerName),

    print: (
        name: string,
        label: LabelConfig,
        text: string
    ) => ipcRenderer.invoke('printer:print', name, label, text),


    getScreenRecognitionSource: () =>
        ipcRenderer.invoke('screen-recognition:get-source'),


    openPreviewWindow: (base64: string) =>
        ipcRenderer.invoke('preview:open', base64),


    showWorkOverlayWindow: (area: SelectedArea) =>
        ipcRenderer.invoke('work-overlay:show', area),

    updateWorkOverlayText: (text: string) =>
        ipcRenderer.send('work-overlay:update-text', text),

    hideWorkOverlayWindow: () =>
        ipcRenderer.send('work-overlay:hide'),

    onWorkOverlayArea: (callback: (area: SelectedArea) => void) => {
        ipcRenderer.on(
            'work-overlay:set-area',
            (_, area: SelectedArea) => {
                callback(area);
            }
        )
    },

    onWorkOverlayUpdateText: (callback: (text: string) => void) => {
        ipcRenderer.on(
            'work-overlay:update-text',
            (_, text: string) => {
                callback(text);
            }
        )
    },

    stopRecognition: () => {
        ipcRenderer.send('work-overlay:stop-recognition')
    },

    onStopRecognition: (callback: () => void) => {
        ipcRenderer.on('work-overlay:stop-recognition', () => {
            callback()
        })
    },

    getWorkOverlayArea: () =>
        ipcRenderer.invoke('work-overlay:get-area'),
})