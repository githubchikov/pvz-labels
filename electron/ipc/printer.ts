import { ipcMain, BrowserWindow, shell } from 'electron';
import { exec } from 'child_process';

function getLabelHtml(width: number, height: number, text: string): string {
    const isRotated = width < height;
    const minSide = Math.min(width, height);
    const fontSizePt = minSide * 1.2;
    const rotateCss = isRotated ? 'transform: rotate(90deg);' : 'transform: rotate(180deg);';

    return `
        <!DOCTYPE html>
        <html lang="ru">
            <head>
                <style>
                    @page {
                        size: ${width}mm ${height}mm;
                        margin: 0;
                    }
                    html,
                    body {
                        margin: 0;
                        padding: 0;
                        width: ${width}mm;
                        height: ${height}mm;
                        background: white;
                        overflow: hidden;
                        position: relative;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                    .label-text {
                        position: absolute;
                        ${rotateCss}
                        font-family: "Euclid Circular A", Arial, sans-serif;
                        font-size: ${fontSizePt}pt;
                        font-weight: bold;
                        color: black;
                        white-space: nowrap;
                        line-height: 1;
                        text-align: center;
                        max-width: 99%;
                    }
                </style>
            </head>
            <body>
                <div class="label-text">${text}</div>
            </body>
        </html>
    `;
}

export function registerPrinterIPC(mainWindow: BrowserWindow | null) {
    ipcMain.handle('printer:list', async () => {
        const win = mainWindow || BrowserWindow.getAllWindows()[0];
        if (!win) return [];
        return await win.webContents.getPrintersAsync();
    });

    ipcMain.handle('printer:print', async (_event, printerName: string, width: number = 30, height: number = 10, text: string) => {
        console.log(`[Printer] Print request: ${printerName}, Size: ${width}x${height}mm`);

        return new Promise((resolve) => {
            const printWindow = new BrowserWindow({
                show: false,
                width: 500,
                height: 500,
                webPreferences: {
                    nodeIntegration: false,
                    contextIsolation: true
                }
            });

            const htmlContent = getLabelHtml(width, height, text);
            printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

            printWindow.webContents.on('did-finish-load', () => {
                printWindow.webContents.print(
                    {
                        deviceName: printerName,
                        silent: true,
                        pageSize: {
                            width: width * 1000,
                            height: height * 1000
                        },
                        margins: {
                            marginType: 'none'
                        },
                        printBackground: true
                    },
                    (success, errorType) => {
                        printWindow.destroy();
                        if (success) {
                            console.log('[Printer] Job sent.');
                            resolve({ success: true, message: 'Label printed' });
                        } else {
                            console.error('[Printer] Failed:', errorType);
                            resolve({ success: false, error: errorType });
                        }
                    }
                );
            });

            printWindow.webContents.on('did-fail-load', () => {
                printWindow.destroy();
                resolve({ success: false, error: 'Failed to load content' });
            });

            setTimeout(() => {
                if (!printWindow.isDestroyed()) {
                    printWindow.destroy();
                    resolve({ success: false, error: 'Timeout' });
                }
            }, 10000);
        });
    });

    ipcMain.handle('printer:openSettings', async (_event, printerName: string) => {
        return new Promise((resolve) => {
            const command = `rundll32 printui.dll,PrintUIEntry /p /n "${printerName}"`;

            exec(command, (error) => {
                if (error) {
                    console.error('[Printer] Failed to open settings:', error);
                    shell.openPath('control printers');
                    resolve({ success: false, error: error.message });
                } else {
                    resolve({ success: true });
                }
            });
        });
    });
}