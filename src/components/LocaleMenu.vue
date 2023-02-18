<template>
  <select v-model="$i18n.locale" class="form-select-sm" aria-label="locale">
    <option
      v-for="locale in $i18n.availableLocales"
      v-bind:key="`locale-${locale}`"
      v-bind:value="locale"
    >
      {{ locale }}
    </option>
  </select>
</template>
