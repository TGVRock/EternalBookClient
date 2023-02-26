// i18nのコンポーネントを導入する
import { createI18n } from "vue-i18n";

// 翻訳用のファイルを導入する
import ja from "./ja";
import en from "./en";

const i18n = createI18n({
  legacy: false, // you must set `false`, to use Composition API
  locale: "ja", // デフォルトは日本語
  fallbackLocale: "en", // set fallback locale
  messages: {
    en,
    ja,
  },
  datetimeFormats: {
    en: {
      short: {
        year: "numeric",
        month: "short",
        day: "numeric",
      },
      long: {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false,
      },
    },
    ja: {
      short: {
        year: "numeric",
        month: "short",
        day: "numeric",
      },
      long: {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false,
      },
    },
  },
});
export default i18n;
