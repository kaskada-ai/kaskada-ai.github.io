<template>
  <div class="card card--item">
    <div class="card-header"></div>
    <div class="card-body">
      <h4>{{ event.title }}</h4>
      <p>
        <span>{{ date }}</span>
      </p>
      <a :href="event.link">Read More</a>
    </div>
  </div>
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
