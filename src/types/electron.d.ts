export {}

declare global {
    interface Window {
        electronAPI: {
            getPrinters: () => Promise<string[]>

            print: (printerName: string, width, height) => Promise<boolean>

            openPrinterSettings: (printerName: string) => Promise<boolean>

            // onWorkOverlayUpdateText(param: ((text) => void) | any): void;
            // async updatePrinterConfig(selected, parse: any): any;
        }
    }
}