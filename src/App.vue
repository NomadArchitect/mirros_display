<template>
  <div id="app">

    <main v-if="!systemStatus.setup_completed">
      <Setup />
    </main>

    <main v-else-if="systemStatus.online === false" class="text-center h3">
      <p>
        {{ t("Something is wrong with your glancr's Wi-Fi connection. Please reconnect your phone or laptop with the Wi-Fi GlancrAP and check if you entered the correct Wi-Fi name and password.") }}

      </p>
    </main>

    <main v-else-if="errors.length != 0">
      <div v-for="error in errors" :key="error.id">
        <span>{{ t("Error") }} {{ error.code }}: {{ error.title }}</span>
        <span>{{ error.detail }} ({{ t("Source") }}: {{ error.source }})</span>
        <span>{{ t("HTTP Status") }}: {{ error.status }}</span>
      </div>
    </main>

    <main v-else-if="loading" class="spinner">
      <AnimatedLoader />
    </main>

    <main v-else class="grid-stack">
      <div v-for="widgetInstance in widgetInstances" :key="widgetInstance.id" class="grid-stack-item" :data-gs-x="widgetInstance.attributes.position.x" :data-gs-y="widgetInstance.attributes.position.y" :data-gs-width="widgetInstance.attributes.position.width" :data-gs-height="widgetInstance.attributes.position.height">
        <WidgetInstanceWrapper :widgetInstance="widgetInstance" />
      </div>
    </main>

  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";

import WidgetInstanceWrapper from "@/components/WidgetInstanceWrapper";
import AnimatedLoader from "@/components/AnimatedLoader";
import Setup from "@/components/Setup";

export default {
  name: "app",
  components: {
    WidgetInstanceWrapper,
    AnimatedLoader,
    Setup
  },
  data: function() {
    return {
      loading: true
    };
  },
  computed: {
    ...mapState(["errors", "widgetInstances", "systemStatus"]),
    ...mapGetters(["language"])
  },
  beforeMount: function() {
    this.fetchData().then(() => {
      this.loading = false;
      this.$options.interval = setInterval(this.fetchData, 50000);
    });
  },
  beforeDestroy: function() {
    clearInterval(this.$options.interval);
  },
  methods: {
    fetchData: function() {
      return Promise.all([
        this.$store.dispatch("fetchSystemStatus"),
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
      top: $vertical_padding / 2;
      left: $horizontal_padding / 2;
      right: $horizontal_padding / 2;
      bottom: $vertical_padding / 2;
      width: auto;
      z-index: 0;
      overflow-x: visible; // TODO: hidden once styling is complete
      overflow-y: visible; // TODO: hidden once styling is complete
    }
  }
}

.spinner {
  width: 10%;
  height: 10vh;
  position: relative;
  margin: 0 auto;
  top: 50vh;
}

.centered {
  text-align: center;
  margin: 0 auto;
}
</style>
