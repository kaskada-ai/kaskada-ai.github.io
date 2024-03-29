import { createApp } from "vue/dist/vue.esm-bundler.js";
import SearchResults from "~/components/search/SearchResults.vue";
import SearchForm from "~/components/search/SearchForm.vue";
import { calculateWindowHeight } from "~/utils/styles";
import { loadMarketoForms } from "../utils/marketo";
import { initAnnouncement, initAnnouncementButton } from "../utils/announcement";

const app = createApp({});
app.component("searchForm", SearchForm);
app.component("searchResults", SearchResults);
app.mount("#main");

addEventListener("DOMContentLoaded", function () {
  calculateWindowHeight();
  loadMarketoForms();
  initAnnouncement();
  initAnnouncementButton();

  window.addEventListener("resize", calculateWindowHeight);
});
