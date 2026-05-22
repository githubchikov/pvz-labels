import {ipcMain, BrowserWindow} from 'electron';
import {exec} from 'child_process';

import type {Result} from '../types/printer'
import {printLabel} from '../services/printer.service';
import {setPrintConfig} from '../store/printConfig'


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

    ipcMain.handle(
        'printer:print',
        async (_, printerName, label, text) => {
            return await printLabel(
                printerName,
                label,
                text
            )
        }
    )

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

    ipcMain.handle(
        'printer:update-config',
        (_, config) => {

            setPrintConfig(config)

            console.log(
                '[IPC][PRINTER] Config updated'
            )

            return {
                success: true
            }
        }
    )
}