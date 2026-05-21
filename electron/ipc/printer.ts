import {ipcMain, BrowserWindow} from 'electron';
import {exec} from 'child_process';

import type {LabelConfig, Result} from '../types/printer'
import {getLabelHtml, getPageSize} from '../services/printer.service';


export function registerPrinterIPC() {
    ipcMain.handle('printer:list', async () => {
        const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0]
        if (!win) {
            console.error('[IPC][PRINTER] Failed to get window for printer list');
            return [];
        }

        console.log('[IPC][PRINTER] Getting printers list');
        return win.webContents.getPrintersAsync();
    })

    ipcMain.handle('printer:print', async (_, printerName: string, label: LabelConfig, text: string) => {
        console.log('[IPC][PRINTER] Starting print job:', {
            printerName,
            text,
            label
        });

        return new Promise<Result>((resolve) => {
            const printWindow = new BrowserWindow({
                show: false,
                width: 500,
                height: 500,
                autoHideMenuBar: true,

                webPreferences: {
                    nodeIntegration: false,
                    contextIsolation: true
                }
            });

            const htmlContent = getLabelHtml(label, text);
            printWindow.loadURL(
                `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`
            );

            const timeout = setTimeout(() => {
                if (!printWindow.isDestroyed()) {
                    console.error('[IPC][PRINTER] Print timeout exceeded');
                    printWindow.destroy();
                    resolve({
                        success: false,
                        error: 'Print timeout exceeded'
                    });
                }
            }, 5000);

            printWindow.webContents.once('did-finish-load', () => {
                console.log('[IPC][PRINTER] Print window loaded');

                printWindow.webContents.print({
                    deviceName: printerName,
                    silent: true,
                    pageSize: getPageSize(label),
                    printBackground: true,
                    margins: {
                        marginType: 'none'
                    }
                }, (success, error) => {
                    clearTimeout(timeout);

                    if (!printWindow.isDestroyed()) {
                        printWindow.destroy();
                    }

                    if (success) {
                        console.log('[IPC][PRINTER] Print job sent successfully');
                        resolve({
                            success: true
                        });
                    } else {
                        console.error('[IPC][PRINTER] Print failed:', error);
                        resolve({
                            success: false,
                            error: error || 'Unknown print error'
                        });
                    }
                });
            });

            printWindow.webContents.once('did-fail-load', (_, errorCode, errorDescription) => {
                console.error(
                    '[IPC][PRINTER] Failed to load print window:',
                    errorCode,
                    errorDescription
                );

                if (!printWindow.isDestroyed()) {
                    printWindow.destroy();
                }

                resolve({
                    success: false,
                    error: 'Failed to load print window'
                });
            });
        });
    });


    ipcMain.handle('printer:openSettings', async (_, printerName: string) => {
        console.log('[IPC][PRINTER] Opening printer settings:', printerName);

        return new Promise<Result>((resolve) => {
            const command = `rundll32 printui.dll,PrintUIEntry /p /n "${printerName}"`;

            exec(command, (error) => {
                if (error) {
                    console.error(
                        '[IPC][PRINTER] Failed to open printer settings, opening control panel instead:',
                        error
                    );

                    exec('control printers');

                    resolve({
                        success: false,
                        error: error.message || 'Failed to open printer settings'
                    });
                } else {
                    console.log('[IPC][PRINTER] Printer settings opened successfully');

                    resolve({
                        success: true
                    });
                }
            });
        });
    });
}