<template>
  <form @submit.prevent="onSubmit" class="form-inline form--search">
    <input type="hidden" class="form-control" name="type" :value="type" />

    <label class="sr-only" for="query">Search</label>
    <div class="input-group mb-2 mr-sm-2">
      <input
        type="search"
        class="form-control"
        placeholder="Search"
        name="query"
        id="query"
        :value="query"
      />
    </div>
  </form>
</template>

<script>
import { getQueryParam } from "~/utils";

export default {
  props: ["type"],

  data() {
    const query = getQueryParam("query") || "";
    return {
      query: query,
    };
  },

  methods: {
    onSubmit() {
      const formData = new FormData(event.target);
      const data = [...formData.entries()];
      const asString = data
        .map((x) => `${encodeURIComponent(x[0])}=${encodeURIComponent(x[1])}`)
        .join("&");

      window.location = window.kaskada.BASE_URL + "/search?" + asString;
    },
  },
};
</script>
