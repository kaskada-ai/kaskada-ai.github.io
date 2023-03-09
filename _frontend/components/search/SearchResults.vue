<template>
  <div class="row">
    <div class="col-md-4 d-flex mb-4" v-for="item in results">
      <event :event="item" v-if="item.type === 'event'" />
      <blog-post :post="item" v-if="item.type === 'post'" />
    </div>

    <div class="col-md-12" v-if="noResults">
      <div class="row justify-content-center">
        <div class="col-md-7 text-center">
          <h1>No Results</h1>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { filterByQuery, getQueryParam, sortByDateTitle } from "~/utils";
import { getEvents, getBlogPosts } from "~/utils/api";
import Event from "~/components/cards/Event.vue";
import BlogPost from "~/components/cards/BlogPost.vue";

export default {
  components: {
    Event,
    BlogPost,
  },

  data() {
    return {
      type: "all",
      query: "",
      results: [],
    };
  },

  mounted() {
    const type = getQueryParam("type") || "all";
    const query = getQueryParam("query") || "";

    this.query = query;
    this.type = type;

    if (query && query !== "") {
      let promises = [];

      if (type === "events" || type === "all") {
        promises.push(getEvents());
      }

      if (type === "blog" || type === "all") {
        promises.push(getBlogPosts());
      }

      Promise.all(promises)
        .then((response) => {
          const [res1 = [], res2 = []] = response;
          const results = [...(res1 || []), ...(res2 || [])]
            .filter((item) => filterByQuery(item, query))
            .sort(sortByDateTitle);

          this.results = results;
        })
        .catch(console.error);
    }
  },

  computed: {
    isValidQuery() {
      if (!this.query) return false;

      return this.query.length > 0;
    },

    noResults() {
      return this.isValidQuery && this.results.length === 0;
    },
  },
};
</script>
