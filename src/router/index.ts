import { createRouter, createWebHashHistory } from 'vue-router'

import Main from '../pages/Main.vue'
import AreaSelector from '../pages/AreaSelector.vue'

export const router = createRouter({
    history: createWebHashHistory(),

    routes: [
        {
            path: '/',
            component: Main
        },
        {
            path: '/area-selector',
            component: AreaSelector
        }
    ]
})