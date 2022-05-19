import { createRouter, createWebHistory } from "vue-router";
import PreviewPage from "@/pages/PreviewPage";

const routes = [
  { path: "/preview/:peerId", component: PreviewPage },
  { path: "/video/:peerId", component: import("@/pages/VideoPage") },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
