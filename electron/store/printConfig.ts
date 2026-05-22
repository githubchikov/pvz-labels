import {LabelConfig} from "../types/printer.ts";

let printConfig: {
    printerName: string,
    label: LabelConfig
} | null = null;

export function setPrintConfig(config: {
    printerName: string,
    label: LabelConfig
}) {
    console.log('[CONFIG] update received in main:', config);
    printConfig = config;
}

export function getPrintConfig() {
    return printConfig;
}