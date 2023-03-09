import { createApp } from "vue/dist/vue.esm-bundler.js";
import SearchResults from "~/components/search/SearchResults.vue";
import SearchForm from "~/components/search/SearchForm.vue";

const app = createApp({});
app.component("searchForm", SearchForm);
app.component("searchResults", SearchResults);
app.mount("#main");

