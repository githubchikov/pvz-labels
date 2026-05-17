import { ipcMain, BrowserWindow, shell } from 'electron';
import { exec } from 'child_process';

function getLabelHtml(width: number, height: number, offsetX: number, offsetY: number, text: string): string {
    const isRotated = width < height;
    const minSide = Math.min(width, height);
    const fontSizePt = minSide * 1.2;

    const rotateCss = isRotated
        ? `transform: translate(${offsetX}mm, ${offsetY}mm) rotate(90deg);`
        : `transform: translate(${offsetX}mm, ${offsetY}mm);`;

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
                    }
                </style>
            </head>
            <body>
                <div class="label-text">${text}</div>
                
                <script>
                    window.onload = () => {
                        const text = document.querySelector('.label-text');
                        const container = document.body;
                    
                        let fontSize = 200;
                    
                        text.style.fontSize = fontSize + 'pt';
                    
                        function fits() {
                            const rect = text.getBoundingClientRect();
                            const containerRect = container.getBoundingClientRect();
                        
                            return (
                                rect.left >= containerRect.left &&
                                rect.top >= containerRect.top &&
                                rect.right <= containerRect.right &&
                                rect.bottom <= containerRect.bottom
                            );
                        }
                    
                        while (!fits() && fontSize > 4) {
                            fontSize -= 1;
                            text.style.fontSize = fontSize + 'pt';
                        }
                    };
                </script>
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

    ipcMain.handle('printer:print', async (_,
                                           printerName: string,
                                           width: number, height: number,
                                           offsetX: number, offsetY: number,
                                           text: string) => {

        return new Promise((resolve) => {
            const printWindow = new BrowserWindow({
                show: false,
                width: 500,
                height: 500,

                autoHideMenuBar: false,

                webPreferences: {
                    nodeIntegration: false,
                    contextIsolation: true
                }
            });

            const htmlContent = getLabelHtml(width, height, offsetX, offsetY, text);
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