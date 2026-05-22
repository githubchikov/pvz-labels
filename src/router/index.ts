import { createRouter, createWebHashHistory } from 'vue-router'

import Main from '../pages/Main.vue'

export const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            component: Main
        }
    ]
})