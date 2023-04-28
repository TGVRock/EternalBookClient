<script setup lang="ts">
import { ref, watch } from "vue";
import * as PDFJS from "pdfjs-dist";
import { isHtml, getChainDataType, getMimeFromDataUrl } from "@/utils/mime";
import { ChainDataType } from "@/models/enums/ChainDataType";

// Props
const props = defineProps<{
  /** Base64データ */
  base64: string;
}>();

// Reactives
const mime = ref("");
const dataUri = ref("");
const dataType = ref(ChainDataType.Unavailable);

// Watch
watch(
  () => props.base64,
  () => {
    getMimeFromDataUrl(props.base64)
      .then((value) => {
        mime.value = value;
        dataUri.value = props.base64;
        dataType.value = getChainDataType(value);
        if (dataType.value === ChainDataType.Pdf) {
          setPdfData();
        }
      })
      .catch(() => {
        mime.value = "";
        dataUri.value = "";
        dataType.value = ChainDataType.Unavailable;
      });
  },
  { immediate: true }
);

/**
 * PDFデータ設定
 */
function setPdfData() {
  if (dataType.value !== ChainDataType.Pdf) {
    return;
  }
  PDFJS.GlobalWorkerOptions.workerSrc =
    "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.5.141/build/pdf.worker.min.js";
  PDFJS.getDocument(dataUri.value).promise.then((pdf) => {
    /**
     * 指定ページ以降のページをレンダリングする
     * @param pageNumber レンダリング開始ページ番号
     */
    const renderPdfPages = (pageNumber: number) => {
      pdf.getPage(pageNumber).then((page) => {
        const pdfArea = document.getElementById("pdfArea");
        if (pdfArea === null) {
          return;
        }
        const viewport = page.getViewport({ scale: 1.0 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        canvas.classList.add("pdf-page");
        const renderContext = {
          canvasContext: context!,
          viewport: viewport,
        };
        pdfArea.appendChild(canvas);
        page.render(renderContext).promise.then(() => {
          if (pageNumber < pdf.numPages) {
            renderPdfPages(pageNumber + 1);
          }
        });
      });
    };
    // 先頭ページからレンダリング
    renderPdfPages(1);
  });
}
</script>

<template>
  <img
    v-if="dataType === ChainDataType.Image"
    class="img-fluid w-100 border border-4 rounded-2 border-light"
    v-bind:src="dataUri"
    alt="On Chain Data"
  />
  <audio
    v-else-if="dataType === ChainDataType.Audio"
    v-bind:src="dataUri"
    controls="true"
    autoplay="true"
    loop="true"
  ></audio>
  <iframe
    v-else-if="isHtml(mime)"
    v-bind:src="dataUri"
    sandbox="allow-scripts allow-popups"
  ></iframe>
  <video
    v-else-if="dataType === ChainDataType.Movie"
    v-bind:src="dataUri"
    v-bind:type="mime"
    controls="true"
  ></video>
  <div v-else-if="dataType === ChainDataType.Model" class="square-wrapper">
    <model-viewer
      v-bind:src="dataUri"
      class="square"
      camera-controls
      autoplay
    ></model-viewer>
  </div>
  <div
    v-else-if="dataType === ChainDataType.Pdf"
    class="square-wrapper pdf-wrapper"
  >
    <div id="pdfArea" class="square"></div>
  </div>
  <img
    v-else
    class="img-fluid w-100 border border-4 rounded-2 border-light"
    src="@/assets/nodata.png"
    alt="No Data"
  />
</template>

<style scoped>
.square-wrapper {
  overflow-y: auto;
  position: relative;
  width: 100%;
}

.square-wrapper::before {
  content: "";
  display: block;
  padding-top: 100%;
}

.square-wrapper .square {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.pdf-wrapper {
  background-color: #c0c0c0;
}

.pdf-wrapper .square {
  top: 10px;
}

.pdf-wrapper ::v-deep(.pdf-page) {
  padding-left: 10px;
  padding-right: 10px;
  padding-bottom: 10px;
  width: 100%;
}
</style>
