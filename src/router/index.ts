import type { NetworkType } from "symbol-sdk";
import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/viewer",
      name: "ViewerTop",
      component: () => import("../views/Viewer/TopView.vue"),
    },
    {
      path: "/viewer/:netType/:mosaicId",
      name: "ViewerResult",
      component: () => import("../views/Viewer/ResultView.vue"),
      props: (routes) => {
        return {
          netType: Number(routes.params.netType) as NetworkType,
          mosaicId: routes.params.mosaicId,
        };
      },
    },
    {
      path: "/writer",
      name: "WriterTop",
      component: () => import("../views/Writer/TopView.vue"),
    },
    {
      path: "/writer/mosaic",
      name: "CreateMosaic",
      component: () => import("../views/Writer/CreateMosaicProcessingView.vue"),
    },
    {
      path: "/writer/onchain",
      name: "WriteOnChainData",
      component: () => import("../views/Writer/OnChainDataProcessingView.vue"),
    },
  ],
});

export default router;
