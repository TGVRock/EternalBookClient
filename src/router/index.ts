import type { NetworkType } from "symbol-sdk";
import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import CONSTS from "@/utils/consts";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: CONSTS.ROUTENAME_HOME,
      component: HomeView,
    },
    {
      path: "/viewer",
      name: CONSTS.ROUTENAME_VIEWER_TOP,
      component: () => import("../views/Viewer/TopView.vue"),
    },
    {
      path: "/viewer/:netType/:mosaicId",
      name: CONSTS.ROUTENAME_VIEWER_RESULT,
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
      name: CONSTS.ROUTENAME_WRITER_TOP,
      component: () => import("../views/Writer/TopView.vue"),
    },
    {
      path: "/writer/mosaic",
      name: CONSTS.ROUTENAME_WRITER_CREATE_MOSAIC,
      component: () => import("../views/Writer/CreateMosaicProcessingView.vue"),
    },
    {
      path: "/writer/onchain",
      name: CONSTS.ROUTENAME_WRITER_WRITE_ONCHAIN_DATA,
      component: () => import("../views/Writer/OnChainDataProcessingView.vue"),
    },
    {
      path: "/settings",
      name: CONSTS.ROUTENAME_SETTINGS,
      component: () => import("../views/Settings/TopView.vue"),
    },
  ],
});

export default router;
