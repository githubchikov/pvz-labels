import { BrowserWindow, screen } from 'electron'

let bannerOverlayWindow: BrowserWindow | null = null

export function createBannerOverlayWindow() {
    if (bannerOverlayWindow && !bannerOverlayWindow.isDestroyed()) return

    const display = screen.getPrimaryDisplay()

    const width = 340
    const height = 80

    const x = Math.round(
        display.workArea.x + (display.workArea.width - width) / 2
    )

    bannerOverlayWindow = new BrowserWindow({
        width,
        height,
        x,
        y: 40,

        frame: false,
        transparent: true,

        alwaysOnTop: true,
        skipTaskbar: true,

        movable: false,
        resizable: false,
        focusable: false,

        hasShadow: false,
        backgroundColor: '#00000000',

        webPreferences: {
            contextIsolation: true
        }
    })

    bannerOverlayWindow.setIgnoreMouseEvents(true)
    bannerOverlayWindow.setVisibleOnAllWorkspaces(true, {
        visibleOnFullScreen: true
    })

    const html = `
        <html lang="ru">
            <body style="
                margin: 0;
                background: transparent;
                overflow: hidden;
            ">
                <div style="
                    width: 100vw;
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    align-items: center;
                    justify-content: center;
                    background: #222222;
                    color: white;
                    border-radius: 32px;
                    font-family: 'Euclid Circular A', sans-serif;
                    font-size: 20px;
                    font-weight: bold;
                    box-shadow: 0px 0px 0px 2px rgba(130, 130, 130, 1) inset;
                ">
                    <div>PVZ Labels</div>
                    <div>Идет распознавание текста</div>
                </div>
            </body>
        </html>
    `

    bannerOverlayWindow.loadURL(
        'data:text/html;charset=utf-8,' + encodeURIComponent(html)
    )

    bannerOverlayWindow.on('closed', () => {
        bannerOverlayWindow = null
    })
}

export function hideBannerOverlay() {
    if (!bannerOverlayWindow) return

    if (!bannerOverlayWindow.isDestroyed()) {
        bannerOverlayWindow.close()
    }

    bannerOverlayWindow = null
}