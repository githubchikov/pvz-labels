import {desktopCapturer, ipcMain} from "electron";

export function registerScreenRecognitionIPC() {
    ipcMain.handle('screen-recognition:get-source', async () => {
        try {
            const sources = await desktopCapturer.getSources({
                types: ['screen'],
                thumbnailSize: { width: 1920, height: 1080 }
            });

            if (sources.length > 0) {
                return { sourceId: sources[0].id };
            }
            throw new Error('No screens found');
        } catch (error) {
            console.error('[Main] Screen capture error:', error);
            throw error;
        }
    });
}