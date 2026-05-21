import { createRouter, createWebHashHistory } from 'vue-router'

import Main from '../pages/Main.vue'
import AreaSelector from '../pages/AreaSelector.vue'
import WorkOverlayCapture from "../pages/WorkOverlayCapture.vue";
import WorkOverlayOcrHud from "../pages/WorkOverlayOcrHud.vue";


export const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            component: Main
        }, {
            path: '/area-selector',
            component: AreaSelector
        }, {
            path: '/work-overlay-ocr-hud',
            component: WorkOverlayOcrHud
        }, {
            path: '/work-overlay-capture',
            component: WorkOverlayCapture
        }
    ]
})