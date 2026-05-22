import { BrowserWindow } from 'electron'

import {LabelConfig} from '../types/printer'
import {Result} from '../types/printer'
import {getPrintConfig} from "../store/printConfig.ts";
import {notification} from "./notification.ts";


export function getLabelHtml(label: LabelConfig, text: string): string {
    const isRotated = label.width < label.height;

    const rotateCss = isRotated
        ? 'rotate(-90deg)'
        : 'none'

    const escapedText = text.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });

    return `
        <!DOCTYPE html>
        <html lang="ru">
            <head>
                <style>
                    @page {
                        size: ${label.width}mm ${label.height}mm;
                        margin: 0;
                    }
                    html,
                    body {
                        margin: 0;
                        padding: 0;
                        width: ${label.width}mm;
                        height: ${label.height}mm;
                        background: white;
                        overflow: hidden;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                    .label-text {
                        font-family: Arial, sans-serif;
                        font-weight: bold;
                        color: black;
                        text-align: center;
                        line-height: 1;
                        transform: ${rotateCss};
                    }
                </style>
            </head>
            <body>
                <div class="label-text">${escapedText}</div>

                <script>
                    window.onload = () => {
                        const text = document.querySelector('.label-text');
                        const container = document.body;
                
                        let fontSize = 120;
                
                        function applySize(size) {
                            text.style.fontSize = size + 'px';
                        }
                
                        function fits() {
                            return (
                                text.scrollWidth <= container.clientWidth - 4 &&
                                text.scrollHeight <= container.clientHeight - 4
                            );
                        }
                
                        applySize(fontSize);
                
                        while (!fits() && fontSize > 4) {
                            fontSize -= 1;
                            applySize(fontSize);
                        }
                    };
                </script>
            </body>
        </html>
    `;
}

export function getPageSize(label: LabelConfig) {
    return {
        width: (Number(label.width) + Number(label.offsetX)) * 1000,
        height: (Number(label.height) + Number(label.offsetY)) * 1000
    }
}

export async function printLabel(
    printerName: string,
    label: LabelConfig,
    text: string
): Promise<Result> {

    return new Promise<Result>((resolve) => {

        const config = getPrintConfig()

        if (!config) {
            notification("Выберите принтер", "error")
            return
        }

        if (config.label.width < 10 || config.label.width > 99) {
            notification("Ошибка печати - неверная ширина этикетки (10...99)", "error")
            return
        }

        if (config.label.height < 10 || config.label.height > 99) {
            notification("Ошибка печати - неверная высота этикетки (10...99)", "error")
            return
        }

        if (config.label.offsetX < -99 || config.label.offsetX > 99) {
            notification("Ошибка печати - неверное смещение текста этикетки по горизонтали (-99...99)", "error")
            return
        }

        if (config.label.offsetY < -99 || config.label.offsetY > 99) {
            notification("Ошибка печати - неверное смещение текста этикетки по вертикали (-99...99)", "error")
            return
        }


        const printWindow = new BrowserWindow({
            show: false,
            width: 500,
            height: 500,
            autoHideMenuBar: true,

            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true
            }
        })

        const htmlContent = getLabelHtml(label, text)

        printWindow.loadURL(
            `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`
        )

        const timeout = setTimeout(() => {
            if (!printWindow.isDestroyed()) {
                printWindow.destroy()

                resolve({
                    success: false,
                    error: 'Print timeout exceeded'
                })
            }
        }, 5000)

        printWindow.webContents.once('did-finish-load', () => {
            printWindow.webContents.print({
                deviceName: printerName,
                silent: true,
                pageSize: getPageSize(label),
                printBackground: true,

                margins: {
                    marginType: 'none'
                }

            }, (success, error) => {

                clearTimeout(timeout)

                if (!printWindow.isDestroyed()) {
                    printWindow.destroy()
                }

                resolve({
                    success,
                    error
                })
            })
        })

        printWindow.webContents.once(
            'did-fail-load',
            () => {

                if (!printWindow.isDestroyed()) {
                    printWindow.destroy()
                }

                resolve({
                    success: false,
                    error: 'Failed to load print window'
                })
            }
        )
    })
}