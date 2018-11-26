<template>
  <div id="app">

    <main v-if="loading" class="spinner">
      <AnimatedLoader />
    </main>

    <main v-else-if="!systemStatus.setup_completed">
      <Setup />
    </main>

    <main v-else-if="!systemStatus.online && !connectionTimeout" class="spinner">
      <AnimatedLoader />
      <p>{{ t("Connecting") }}</p>
    </main>

    <main v-else-if="!systemStatus.online && connectionTimeout && systemStatus.ap_active" class="centered-message">
      <ErrorIcon class="error__icon" />
      <h4>
        {{ t("Something is wrong with your glancr's Wi-Fi connection.") }}
      </h4>
      <p>
        {{ t("Please reconnect your phone or laptop with the Wi-Fi 'glancr setup' and check if you entered the correct Wi-Fi name and password.") }}
      </p>
    </main>

    <main v-else-if="errors.length != 0">
      <div v-for="error in errors" :key="error.id">
        <span>{{ t("Error") }} {{ error.code }}: {{ error.title }}</span>
        <span>{{ error.detail }} ({{ t("Source") }}: {{ error.source }})</span>
        <span>{{ t("HTTP Status") }}: {{ error.status }}</span>
      </div>
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
import ErrorIcon from "@/assets/icons/error.svg";

export default {
  name: "app",
  components: {
    WidgetInstanceWrapper,
    AnimatedLoader,
    Setup,
    ErrorIcon,
  },
  data: function() {
    return {
      loading: true,
      connectionAttempts: 0
    };
  },
  locales: {
    deDe: {
      Connecting: "Verbinden",
      "Something is wrong with your glancr's Wi-Fi connection.":
        "Etwas stimmt nicht mit der WLAN-Verbindung deines glancr.",
      "Please reconnect your phone or laptop with the Wi-Fi 'glancr setup' and check if you entered the correct Wi-Fi name and password.":
        "Bitte verbinde dein Telefon oder deinen Laptop erneut mit dem WLAN 'glancr setup' und prüfe, ob du WLAN-Name und Passwort richtig eingegeben hast."
    }
  },
  computed: {
    ...mapState(["errors", "widgetInstances", "systemStatus"]),
    ...mapGetters(["language"])
  },
  beforeMount: function() {
    this.fetchData().then(() => {
      this.loading = false;
      this.$options.interval = setInterval(this.fetchData, 5000);
    });
  },
  beforeDestroy: function() {
    clearInterval(this.$options.interval);
  },
  methods: {
    connectionTimeout: function() {
      if (this.connectionAttempts > 5) {
        return true;
      } else if (!this.systemStatus.online && !this.systemStatus.ap_active) {
        this.connectionAttempts++;
        return false;
      } else {
        this.connectionAttempts = 0;
        return false;
      }
    },
    fetchData: function() {
      return Promise.all([
        this.$store.dispatch("fetchSystemStatus"),
        this.$store.dispatch("fetchSetting", "system_language"),
        this.$store.dispatch("fetchSetting", "personal_name"),
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
      overflow-x: hidden;
      overflow-y: hidden;
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

.centered-message {
  position: relative;
  margin: 0 auto;
  top: 30vh;
  max-width: 75%;
  font-size: 3rem;
  text-align: center;
  line-height: 3.5rem;
}

.error__icon {
  width: 15rem;
}
</style>
