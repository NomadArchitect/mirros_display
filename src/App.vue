<template>
  <div id="app">
    <!-- <span v-if="serverError.length != 0">{{serverError}}</span> -->

    <main v-if="errors.length != 0">
      <span v-for="error in errors" :key="error.id">Error {{ error.status }}: {{error.title}} (Source: {{error.source}})</span>
    </main>

    <main v-else-if="widgetInstances.length === 0">
      <p>Loading</p>
    </main>

    <main>
      <WidgetInstanceWrapper
        v-for="widgetInstance in widgetInstances" :key="widgetInstance.id"
        :widgetInstance="widgetInstance" />
    </main>

  </div>
</template>

<script>
import { mapState } from "vuex";

import WidgetInstanceWrapper from "@/components/WidgetInstanceWrapper";

export default {
  name: "app",
  components: {
    WidgetInstanceWrapper
  },
  computed: {
    ...mapState(["errors", "widgetInstances"])
  },
  beforeMount: function() {
    this.fetchData();
    window.setInterval(this.fetchData, 100000);
  },
  methods: {
    fetchData: function() {
      this.$store.dispatch("fetchWidgetInstances", {
        include: [
          "widget",
          "source-instances",
          "source-instances.record-links",
          "source-instances.record-links.recordable"
        ]
      });
    }
  }
};
</script>

<style>
body {
  margin: 0;
  background-color: black;
}

#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: white;
}
</style>
