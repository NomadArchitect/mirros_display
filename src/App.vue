<template>
  <div id="app">
    <main v-if="loading" class="spinner"><AnimatedLoader /></main>

    <main v-else-if="networkError" class="centered-message">
      <h4>{{ t("The server is not responding.") }}</h4>
      <p>
        {{
          t(
            "This should not happen, but obviously did. Please try restarting the device and contact support if that does not resolve the issue."
          )
        }}
      </p>
      <span class="smaller">{{ t("Reconnecting in") }} {{ countdown }}s …</span>
    </main>

    <main
      v-else-if="
        (!loading && !systemStatus.setup_completed) ||
          (systemStatus.setup_completed &&
            !systemStatus.connecting &&
            systemStatus.ap_active)
      "
    >
      <Setup />
    </main>

    <main
      v-else-if="!systemStatus.online && systemStatus.connecting"
      class="spinner"
    >
      <AnimatedLoader />
      <p style="text-align: center">{{ t("Connecting") }}</p>
    </main>

    <main
      v-else-if="!systemStatus.online && systemStatus.ap_active"
      class="centered-message"
    >
      <ErrorIcon class="error__icon" />
      <h4>
        {{ t("Something is wrong with your glancr's Wi-Fi connection.") }}
      </h4>
      <p>
        {{
          t(
            "Please reconnect your phone or laptop with the Wi-Fi 'glancr setup' and check if you entered the correct Wi-Fi name and password."
          )
        }}
      </p>
    </main>

    <main v-else>
      <section class="grid-stack">
        <div
          v-for="widgetInstance in widgetInstances"
          :key="widgetInstance.id"
          class="grid-stack-item"
          :data-gs-x="widgetInstance.attributes.position.x"
          :data-gs-y="widgetInstance.attributes.position.y"
          :data-gs-width="widgetInstance.attributes.position.width"
          :data-gs-height="widgetInstance.attributes.position.height"
        >
          <WidgetInstanceWrapper
            :widgetInstance="widgetInstance"
            :languageTag="languageTag()"
          />
        </div>
      </section>

      <!--
        <div slot="fetch-errors" v-for="error in errors" :key="error.id">
          <span>{{ t("Error") }} {{ error.code }}: {{ error.title }}</span>
          <span>{{ error.detail }} ({{ t("Source") }}: {{ error.source }})</span>
          <span>{{ t("HTTP Status") }}: {{ error.status }}</span>
        </div>
      -->
      <SystemErrorOverlay v-if="!systemStatus.online">
        <OfflineIcon slot="icon" />
        <template slot="title">{{ t("Your glancr is offline.") }}</template>
        <template slot="text">{{
          t(
            "mirr.OS is connected to your network, but cannot reach the internet. Please check your router if the internet connection is active."
          )
        }}</template>
      </SystemErrorOverlay>
    </main>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";

import WidgetInstanceWrapper from "@/components/WidgetInstanceWrapper";
import AnimatedLoader from "@/components/AnimatedLoader";
import Setup from "@/components/Setup";
import ErrorIcon from "@/assets/icons/error.svg";
import OfflineIcon from "@/assets/icons/offline.svg";

import SystemErrorOverlay from "@/components/SystemErrorOverlay";

export default {
  name: "app",
  components: {
    WidgetInstanceWrapper,
    AnimatedLoader,
    Setup,
    ErrorIcon,
    OfflineIcon,
    SystemErrorOverlay
  },
  data: function() {
    return {
      loading: true,
      countdown: 5
    };
  },
  watch: {
    networkError: function(val) {
      if (val === true) {
        this.$options.countdown = setInterval(this.doCountdown, 1000);
      } else {
        clearInterval(this.$options.countdown);
      }
    },
    systemStatus: function(newVal) {
      if (newVal.refresh_frontend === true) {
        this.fetchData();
      }
    }
  },
  computed: {
    ...mapState(["errors", "widgetInstances", "systemStatus", "networkError"]),
    ...mapGetters(["language"])
  },
  beforeMount: function() {
    return Promise.all([
      this.$store.dispatch("fetchSystemStatus"),
      this.fetchData()
    ]).then(() => {
      this.loading = false;
      this.$options.interval = setInterval(this.checkRefresh, 3000);
    });
  },
  beforeDestroy: function() {
    clearInterval(this.$options.interval);
  },
  methods: {
    checkRefresh: function() {
      this.$store.dispatch("fetchSystemStatus");
    },
    fetchData: function() {
      return Promise.all([
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
      ]).then(() => {
        if (this.systemStatus.setup_completed) {
          this.$translate.setLang(this.language);
          document.documentElement.setAttribute("lang", this.languageTag());
        }
      });
    },
    doCountdown: function() {
      if (this.countdown > 0) {
        this.countdown--;
      } else {
        this.$store.commit("SET_NETWORK_ERROR", false);
        this.countdown = 5;
      }
    },
    languageTag: function() {
      const regex = new RegExp(/([A-Z]{1}[a-z]{1})/g);
      return this.language.replace(regex, match => {
        return match.toUpperCase().padStart(match.length + 1, "-");
      });
    }
  },
  locales: {
    deDe: {
      "The server is not responding.": "Der Server reagiert nicht.",
      "This should not happen, but obviously did. Please try restarting the device and contact support if that does not resolve the issue.":
        "Das sollte nicht passieren, ist es aber offensichtlich. Bitte starte das Gerät neu und kontaktiere den Support, falls sich der Fehler so nicht beheben lässt.",
      "Reconnecting in": "Verbindungsversuch in",
      Connecting: "Verbinden",
      "Something is wrong with your glancr's Wi-Fi connection.":
        "Etwas stimmt nicht mit der WLAN-Verbindung deines glancr.",
      "Please reconnect your phone or laptop with the Wi-Fi 'glancr setup' and check if you entered the correct Wi-Fi name and password.":
        "Bitte verbinde dein Telefon oder deinen Laptop erneut mit dem WLAN 'glancr setup' und prüfe, ob du WLAN-Name und Passwort richtig eingegeben hast.",
      "Your glancr is offline.": "Dein glancr ist offline.",
      "mirr.OS is connected to your network, but cannot reach the internet. Please check your router if the internet connection is active.":
        "mirr.OS ist mit deinem Netzwerk verbunden, kann aber das Internet nicht erreichen. Bitte prüfe an deinem Router, ob die Internetverbindung aktiv ist."
    }
  }
};
</script>

<style lang="scss">
$gridstack-columns: 12 !default;
$gridstack-rows: 21.33333 !default;
$horizontal_padding: 20px !default;
$vertical_padding: 20px !default;

.grid-stack {
  position: relative;
  margin: 5px;
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

.smaller {
  font-size: 80%;
}

.error__icon {
  width: 15rem;
}
</style>
