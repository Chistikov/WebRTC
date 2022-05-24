import { createRouter, createWebHistory } from "vue-router";
import PreviewPage from "@/pages/PreviewPage";
import VideoPage from "@/pages/VideoPage";
// import Stream from "@/components/Stream";

const routes = [
  { path: "/preview/:userId/:rooomId", name: 'preview', component: PreviewPage },
  { path: "/video/:userId/:roomId", name: 'video', component: VideoPage},
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
