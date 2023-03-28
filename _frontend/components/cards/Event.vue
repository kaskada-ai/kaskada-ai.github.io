<template>
  <a :href="event.link" class="card card-link card--item">
    <div class="card-header"></div>
    <div class="card-body">
      <h4>{{ event.title }}</h4>
      <p>
        <span>{{ date }}</span>
      </p>
      <span class="btn btn-link">Register Now</span>
    </div>
  </a>
</template>

<script>
import { formatDate } from "~/utils/date";

export default {
  props: ["event"],

  computed: {
    date() {
      return formatDate(this.event.date);
    },
  },
};
</script>
