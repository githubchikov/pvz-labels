import {ipcRenderer} from "electron";

export {}

declare global {
    interface Window {
        electronAPI: {
            openAreaSelector: () => Promise<void>
            closeAreaSelector: () => Promise<void>

            sendSelectedArea: (area: {
                x: number
                y: number
                width: number
                height: number
            }) => void

            onAreaSelected: (
                callback: (area: {
                    x: number
                    y: number
                    width: number
                    height: number
                }) => void
            ) => void


            getPrinters: () => Promise<string[]>

            print: (printerName: string, width, height) => Promise<boolean>

            openPrinterSettings: (printerName: string) => Promise<boolean>


            showWorkOverlayWindow: () => void,

            hideWorkOverlayWindow: () => void,


            getScreenRecognitionSource: () => Promise<{
                sourceId: string
            }>


            openPreviewWindow: () => void
            // onWorkOverlayUpdateText(param: ((text) => void) | any): void;
        }
    }
}