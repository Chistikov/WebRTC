import {createRouter, createWebHashHistory} from 'vue-router'
import PreviewPage from '@/pages/PreviewPage'

const routes = [
    {path: '/', component: PreviewPage},
    {path: '/video', component: import("@/pages/VideoPage")}
]

export const router = createRouter({
    history: createWebHashHistory(),
    routes
})