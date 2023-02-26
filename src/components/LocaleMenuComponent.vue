<script setup lang="ts">
import { useI18n } from "vue-i18n";
const i18n = useI18n();
</script>

<template>
  <select v-model="$i18n.locale" class="form-select-sm" aria-label="locale">
    <option
      v-for="locale in $i18n.availableLocales"
      v-bind:key="`locale-${locale}`"
      v-bind:value="locale"
    >
      {{ i18n.getLocaleMessage(locale).lang }}
    </option>
  </select>
</template>
