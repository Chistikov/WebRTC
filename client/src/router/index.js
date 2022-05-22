import { createRouter, createWebHistory } from "vue-router";
import PreviewPage from "@/pages/PreviewPage";
import VideoPage from "@/pages/VideoPage";
// import Stream from "@/components/Stream";

const routes = [
  { path: "/preview/:userId/:peerId", name: 'preview', component: PreviewPage },
  { path: "/video/:userId/:peerId", name: 'video', component: VideoPage},
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
