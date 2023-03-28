import { createApp } from "vue/dist/vue.esm-bundler.js";
import SearchResults from "~/components/search/SearchResults.vue";
import SearchForm from "~/components/search/SearchForm.vue";
import { calculateWindowHeight } from "~/utils/styles";
import { enableMarketoDebugger, loadMarketoForms } from "../utils/marketo";

const app = createApp({});
app.component("searchForm", SearchForm);
app.component("searchResults", SearchResults);
app.mount("#main");

addEventListener("DOMContentLoaded", function () {
  calculateWindowHeight();
  loadMarketoForms();

  if (document.cookie.match(/^(.*;)?\s*marketoDebugger\s*=\s*[^;]+(.*)?$/)) {
    enableMarketoDebugger();
  }

  window.addEventListener("resize", calculateWindowHeight);
});
