<script setup lang="ts">
import { useWriteMosaicStore } from "@/stores/WriteMosaic";
import CheckboxComponent from "@/components/form/CheckboxComponent.vue";

const writeMosaicStore = useWriteMosaicStore();
</script>

<template>
  <div class="row my-2">
    <div class="col-md-3 col-form-label">
      <label>{{ $t("writer.mosaicFlags") }}</label>
    </div>
    <div class="col-md-9 col-form-label">
      <div class="row row-cols-2">
        <div class="col-md-3">
          <CheckboxComponent
            v-bind:id="'SupplyMutable'"
            v-bind:item-name="$t('mosaicInfo.supplyMutable')"
            v-model:checked="writeMosaicStore.mosaicFlags.supplyMutable"
          />
        </div>
        <div class="col-md-3">
          <CheckboxComponent
            v-bind:id="'Transferable'"
            v-bind:item-name="$t('mosaicInfo.transferable')"
            v-model:checked="writeMosaicStore.mosaicFlags.transferable"
          />
        </div>
        <div class="col-md-3">
          <CheckboxComponent
            v-bind:id="'Restrictable'"
            v-bind:item-name="$t('mosaicInfo.restrictable')"
            v-model:checked="writeMosaicStore.mosaicFlags.restrictable"
          />
        </div>
        <div class="col-md-3">
          <CheckboxComponent
            v-bind:id="'Revokable'"
            v-bind:item-name="$t('mosaicInfo.revokable')"
            v-model:checked="writeMosaicStore.mosaicFlags.revokable"
          />
        </div>
      </div>
    </div>
  </div>
</template>
