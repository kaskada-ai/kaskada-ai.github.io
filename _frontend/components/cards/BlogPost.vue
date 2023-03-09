<template>
  <div class="card card--item">
    <div class="card-header">
      <img
        v-if="post.image"
        class="img-fluid"
        :src="post.image"
        :alt="post.title"
      />
    </div>
    <div class="card-body">
      <h4>{{ post.title }}</h4>
      <p>
        <span v-if="post.author">by {{ post.author }} · </span>
        <span>{{ date }}</span>
      </p>
      <a href="{{ post.url }}">Read More</a>
    </div>
  </div>
</template>

<script>
import { formatDate } from "~/utils/date";

export default {
  props: ["post"],

  computed: {
    date() {
      return formatDate(this.post.date);
    },
  },
};
</script>
