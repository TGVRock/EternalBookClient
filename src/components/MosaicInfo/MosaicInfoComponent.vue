<script setup lang="ts">
import { ref } from "vue";
import type { MosaicInfo } from "symbol-sdk";
import { b2s, t2d } from "@/utils/converter";
import { getBlockTimestamp } from "@/apis/block";
import { getMosaicName } from "@/apis/namespace";
import MosaicInfoRowComponent from "./MosaicInfoRowComponent.vue";

const props = defineProps<{
  mosaicInfo: MosaicInfo;
}>();

const timestamp = ref("N/A");
const alias = ref("N/A");

getBlockTimestamp(props.mosaicInfo.startHeight).then((value) => {
  timestamp.value = undefined !== value ? t2d(value) : "N/A";
});
getMosaicName(props.mosaicInfo.id.toHex()).then((value) => {
  alias.value = undefined !== value ? value : "N/A";
});
</script>

<template>
  <article class="container">
    <div class="row">
      <div class="col-12 text-center">
        <h4>{{ $t("mosaicInfo.title") }}</h4>
      </div>
    </div>
    <MosaicInfoRowComponent
      v-bind:title="$t('mosaicInfo.id')"
      v-bind:data="mosaicInfo.id.toHex()"
    />
    <MosaicInfoRowComponent
      v-bind:title="$t('mosaicInfo.alias')"
      v-bind:data="alias"
    />
    <MosaicInfoRowComponent
      v-bind:title="$t('mosaicInfo.supply')"
      v-bind:data="mosaicInfo.supply.toString()"
    />
    <MosaicInfoRowComponent
      v-bind:title="$t('mosaicInfo.height')"
      v-bind:data="mosaicInfo.startHeight.toString()"
    />
    <MosaicInfoRowComponent
      v-bind:title="$t('mosaicInfo.date')"
      v-bind:data="timestamp"
    />
    <MosaicInfoRowComponent
      v-bind:title="$t('mosaicInfo.address')"
      v-bind:data="mosaicInfo.ownerAddress.plain()"
    />
    <MosaicInfoRowComponent
      v-bind:title="$t('mosaicInfo.supplyMutable')"
      v-bind:data="b2s(mosaicInfo.flags.supplyMutable)"
    />
    <MosaicInfoRowComponent
      v-bind:title="$t('mosaicInfo.transferable')"
      v-bind:data="b2s(mosaicInfo.flags.transferable)"
    />
    <MosaicInfoRowComponent
      v-bind:title="$t('mosaicInfo.restrictable')"
      v-bind:data="b2s(mosaicInfo.flags.restrictable)"
    />
    <MosaicInfoRowComponent
      v-bind:title="$t('mosaicInfo.revokable')"
      v-bind:data="b2s(mosaicInfo.flags.revokable)"
    />
  </article>
</template>
