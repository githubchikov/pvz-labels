import {Notification} from "electron";
import path from "node:path";

import {fileURLToPath} from 'node:url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export function notification(text: string, type="info") {
    new Notification({
        title: 'PVZ Labels',
        body: text,
        icon: path.join(
            __dirname,
            type == 'info' ? '../public/icon.ico' : '../public/error.ico'
        )
    }).show()
}