import {Notification} from "electron";
import path from "node:path";

export function notification(text: string, type="info") {
    new Notification({
        title: 'PVZ Labels',
        body: text,
        icon: path.join(
            process.env.VITE_PUBLIC,
            type === 'info'
                ? 'icon.ico'
                : 'error.ico'
        )
    }).show()
}