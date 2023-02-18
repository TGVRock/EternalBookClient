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
});
export default i18n;
