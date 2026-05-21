import { BrowserWindow } from 'electron'
import {mainWindow} from "../main.ts";


let previewWindow: BrowserWindow | null = null

export function createPreviewWindow(base64: string) {
    if (previewWindow && !previewWindow.isDestroyed()) {
        previewWindow.destroy()
        previewWindow = null
    }

    previewWindow = new BrowserWindow({
        width: 800,
        height: 600,
        autoHideMenuBar: true,
        backgroundColor: '#171717',

        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    })

    const html = `
        <html lang="ru">
            <head>
                <title>PVZ Labels - Предпросмотр</title>
            </head>
            <body style="
                margin: 0;
                background: #171717;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
            ">
                <canvas id="preview"></canvas>
        
                <script>
                    const canvas = document.getElementById('preview');
                    const ctx = canvas.getContext('2d');

                    const img = new Image();

                    img.onload = () => {
                        canvas.width = img.width;
                        canvas.height = img.height;

                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, 0, 0);
                    };

                    img.src = ${JSON.stringify(base64)};
                </script>
            </body>
        </html>
    `

    previewWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html))

    previewWindow.on('closed', () => {
        previewWindow = null
    })

    previewWindow.focus()

    mainWindow?.once('closed', () => {
        if (
            previewWindow &&
            !previewWindow.isDestroyed()
        ) {
            previewWindow.destroy()
        }

        previewWindow = null
    })
}