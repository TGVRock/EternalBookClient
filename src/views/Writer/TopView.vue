<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useWriteMosaicStore } from "@/stores/WriteMosaic";
import { isSSSEnable, getAddress } from "@/utils/sss";
import { getMultisigAddresses } from "@/apis/account";
import type { Address } from "symbol-sdk";
import { useWriteOnChainDataStore } from "@/stores/WriteOnChainData";
import { getMimeFromBase64 } from "@/utils/mime";
import PreviewDataComponent from "@/components/OnChainData/PreviewDataComponent.vue";

const writeMosaicStore = useWriteMosaicStore();
const writeOnChainDataStore = useWriteOnChainDataStore();

const isSSSLinked = computed(() => {
  return isSSSEnable();
});
const sssLinkedAddress = computed(() => {
  return getAddress();
});

writeMosaicStore.linkedAddress = "";
writeMosaicStore.ownerAddress = "";

const multisigAddresses = ref<Array<Address>>([]);
watch(
  isSSSLinked,
  async (): Promise<void> => {
    multisigAddresses.value = [];
    const linkedAddress = getAddress();
    if (undefined === linkedAddress) {
      return;
    }
    writeMosaicStore.linkedAddress = linkedAddress;
    writeMosaicStore.ownerAddress = linkedAddress;
    multisigAddresses.value = await getMultisigAddresses(linkedAddress);
  },
  {
    immediate: true,
  }
);

function onChangeEngraveData(payload: Event): void {
  const target = (payload.target as HTMLInputElement).files || null;
  if (target?.length === undefined || target?.length < 1) {
    return;
  }
  const fileReader = new FileReader();
  fileReader.onload = () => {
    writeOnChainDataStore.dataBase64 = fileReader.result as string;
  };
  fileReader.readAsDataURL(target[0]);
}
</script>

<template>
  <section class="container" id="inputArea">
    <termplate v-if="!isSSSLinked">
      <input
        type="text"
        v-model="writeMosaicStore.ownerAddress"
        placeholder="Input Address..."
      />
    </termplate>
    <termplate v-else>
      <select
        v-model="writeMosaicStore.ownerAddress"
        class="form-select-sm"
        aria-label="network-type"
      >
        <option v-bind:value="sssLinkedAddress">
          {{ sssLinkedAddress }}
        </option>
        <option
          v-for="value in multisigAddresses"
          v-bind:key="`network-type-${value.plain()}`"
          v-bind:value="value.plain()"
        >
          &ensp;(multisig) {{ value.plain() }}
        </option>
      </select>
    </termplate>
    <div class="container">
      <div class="row">
        <div class="col-12">
          <div class="input-group">
            <label class="input-group-btn">
              <div class="btn btn-primary">
                <span id="buttonSelectFileText">Choose File</span>
                <input
                  type="file"
                  class="d-none"
                  v-on:change="onChangeEngraveData"
                />
              </div>
            </label>
          </div>
        </div>
        <PreviewDataComponent
          v-bind:base64="writeOnChainDataStore.dataBase64"
          v-bind:mime="getMimeFromBase64(writeOnChainDataStore.dataBase64)"
        />
      </div>
      <div class="row">
        <label class="col-md-3 col-form-label">
          {{ $t("preview.title") }}
        </label>
        <div class="col-md-9">
          <input
            type="text"
            class="form-control"
            v-model="writeOnChainDataStore.title"
            placeholder="Input Title..."
          />
        </div>
        <label class="col-md-3 col-form-label">
          {{ $t("preview.message") }}
        </label>
        <div class="col-md-9">
          <textarea
            class="form-control"
            v-model="writeOnChainDataStore.message"
            placeholder="Input Message..."
            rows="5"
          ></textarea>
        </div>
      </div>
    </div>
    <div class="container">
      <div class="row">
        <div class="col-6 col-md-3 form-check">
          <input
            v-model="writeMosaicStore.mosaicFlags.supplyMutable"
            class="form-check-input"
            type="checkbox"
            id="inputSupplyMutable"
          />
          <label class="form-check-label" for="inputSupplyMutable">
            {{ $t("mosaicInfo.supplyMutable") }}
          </label>
        </div>
        <div class="col-6 col-md-3 form-check">
          <input
            v-model="writeMosaicStore.mosaicFlags.transferable"
            class="form-check-input"
            type="checkbox"
            id="inputTransferable"
          />
          <label class="form-check-label" for="inputTransferable">
            {{ $t("mosaicInfo.transferable") }}
          </label>
        </div>
        <div class="col-6 col-md-3 form-check">
          <input
            v-model="writeMosaicStore.mosaicFlags.restrictable"
            class="form-check-input"
            type="checkbox"
            id="inputRestrictable"
          />
          <label class="form-check-label" for="inputRestrictable">
            {{ $t("mosaicInfo.restrictable") }}
          </label>
        </div>
        <div class="col-6 col-md-3 form-check">
          <input
            v-model="writeMosaicStore.mosaicFlags.revokable"
            class="form-check-input"
            type="checkbox"
            id="inputRevokable"
          />
          <label class="form-check-label" for="inputRevokable">
            {{ $t("mosaicInfo.revokable") }}
          </label>
        </div>
        <label class="col-md-3 col-form-label">
          {{ $t("mosaicInfo.supply") }}
        </label>
        <div class="col-md-9">
          <input
            v-model="writeMosaicStore.amount"
            type="number"
            class="form-control"
            min="1"
            placeholder="Input Supply Amount..."
          />
        </div>
        <div class="col-sm-12 mt-3 text-center">
          <RouterLink v-bind:to="{ name: 'WriteProcessing' }">
            <button type="button" class="btn btn-primary">Create Mosaic</button>
          </RouterLink>
        </div>
      </div>
    </div>
    <div class="container">
      <div class="row">
        <label class="col-md-3 col-form-label">
          {{ $t("mosaicInfo.id") }}
        </label>
        <div class="col-md-9">
          <input
            type="text"
            class="form-control"
            v-model="writeOnChainDataStore.relatedMosaicIdStr"
            placeholder="Input Mosaic ID..."
          />
        </div>
        <div class="col-sm-12 mt-3 text-center">
          <RouterLink v-bind:to="{ name: 'WriteOnChainData' }">
            <button type="button" class="btn btn-primary">On Chain Data</button>
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>
