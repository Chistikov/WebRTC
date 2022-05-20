import { createRouter, createWebHistory } from "vue-router";
import PreviewPage from "@/pages/PreviewPage";

const routes = [
  { path: "/preview/:userId/:peerId", name: 'preview', component: PreviewPage },
  { path: "/video/:userId/:peerId", name: 'video', component: import("@/pages/VideoPage")},
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
