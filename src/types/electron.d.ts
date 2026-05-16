export {}

declare global {
    interface Window {
        electronAPI: {
            openAreaSelector: () => Promise<void>

            onAreaSelected: (
                callback: (area: {
                    x: number
                    y: number
                    width: number
                    height: number
                }) => void
            ) => void

            sendSelectedArea: (area: {
                x: number
                y: number
                width: number
                height: number
            }) => void

            closeAreaSelector: () => void

            getPrinters: () => Promise<string[]>
            print: (printerName: string, width, height) => Promise<boolean>
            openPrinterSettings: (printerName: string) => Promise<boolean>

            openPreviewWindow: (base64: string) => void
        }
    }
}