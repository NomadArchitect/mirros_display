<template>
  <div id="app">
    <!-- <span v-if="serverError.length != 0">{{serverError}}</span> -->

    <main v-if="errors.length != 0">
      <span v-for="error in errors" :key="error.id">Error {{ error.status }}: {{error.title}} (Source: {{error.source}})</span>
    </main>

    <main v-else-if="loading" class="spinner">
      <p>Loading …</p>
      <!-- TODO: Replace with spinner to avoid translation -->
    </main>

    <main>
      <WidgetInstanceWrapper
        v-for="widgetInstance in widgetInstances" :key="widgetInstance.id"
        :widgetInstance="widgetInstance" />
    </main>

  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";

import WidgetInstanceWrapper from "@/components/WidgetInstanceWrapper";

export default {
  name: "app",
  components: {
    WidgetInstanceWrapper
  },
  data: function() {
    return {
      loading: true
    };
  },
  computed: {
    ...mapState(["errors", "widgetInstances"]),
    ...mapGetters(["language"])
  },
  beforeMount: function() {
    this.fetchData().then(() => {
      this.loading = false;
      window.setInterval(this.fetchData, 100000);
    });
  },
  methods: {
    fetchData: function() {
      return Promise.all([
        this.$store.dispatch("fetchSetting", "system_language"),
        this.$store.dispatch("fetchWidgetInstances", {
          include: [
            "widget",
            "source-instances",
            "source-instances.record-links",
            "source-instances.record-links.recordable"
          ]
        })
      ]).then(() => this.$translate.setLang(this.language));
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
