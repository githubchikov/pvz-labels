import path from 'node:path'
import type { BrowserWindow } from 'electron'

import {
    RENDERER_DIST,
    VITE_DEV_SERVER_URL
} from '../config/env'

export async function loadRendererRoute(
    window: BrowserWindow,
    route: string
) {
    if (VITE_DEV_SERVER_URL) {
        await window.loadURL(`${VITE_DEV_SERVER_URL}/#${route}`)
    } else {
        await window.loadFile(
            path.join(RENDERER_DIST, 'index.html'),
            {
                hash: route
            }
        )
    }
}