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

    <main v-else class="grid-stack">
      <div
      v-for="widgetInstance in widgetInstances"
      :key="widgetInstance.id"
      class="grid-stack-item"
      :data-gs-x="widgetInstance.attributes.position.x"
      :data-gs-y="widgetInstance.attributes.position.y"
      :data-gs-width="widgetInstance.attributes.position.width"
      :data-gs-height="widgetInstance.attributes.position.height"
      >
        <WidgetInstanceWrapper :widgetInstance="widgetInstance" />
      </div>
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

<style lang="scss">
$gridstack-columns: 12 !default;
$gridstack-rows: 20 !default;
$horizontal_padding: 20px !default;
$vertical_padding: 20px !default;

.grid-stack {
  position: relative;
  > .grid-stack-item {
    min-width: 100% / $gridstack-columns;
    position: absolute;
    padding: 0;

    @for $i from 1 through $gridstack-columns {
      &[data-gs-width="#{$i}"] {
        width: (100% / $gridstack-columns) * $i;
      }
      &[data-gs-x="#{$i}"] {
        left: (100% / $gridstack-columns) * $i;
      }
    }

    @for $i from 1 through $gridstack-rows {
      &[data-gs-height="#{$i}"] {
        height: (100vh / $gridstack-rows) * $i;
      }
      &[data-gs-y="#{$i}"] {
        top: (100vh / $gridstack-rows) * $i;
      }
    }
    > .grid-stack-item-content {
      margin: 0;
      position: absolute;
      top: 0;
      left: $horizontal_padding / 2;
      right: $horizontal_padding / 2;
      bottom: 0;
      width: auto;
      z-index: 0;
      overflow-x: hidden;
      overflow-y: hidden;
    }
  }
}

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

.spinner {
  font-size: 5rem;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
