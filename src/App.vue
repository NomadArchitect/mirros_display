<template>
  <div id="app">
    <main v-if="loading" class="spinner"><AnimatedLoader /></main>

    <NetworkError v-else-if="networkError" />

    <main v-else-if="showSetup">
      <Setup />
      <SystemErrorOverlay v-if="!ap_active">
        <OfflineIcon slot="icon" />
        <template slot="title">{{ t("Can't open setup WiFi.") }}</template>
        <template slot="text">{{
          t(
            "Your glancr attempted to open the setup WiFi, but something went wrong. Please reboot the device and contact support if the problem persists."
          )
        }}</template>
      </SystemErrorOverlay>
    </main>

    <main v-else-if="connecting" class="spinner">
      <AnimatedLoader />
      <p style="text-align: center">{{ t("Connecting") }}</p>
    </main>

    <main v-else-if="systemStatus.resetting" class="spinner">
      <AnimatedLoader />
      <p style="text-align: center">{{ t("Reset") }}</p>
    </main>

    <ConnectionError v-else-if="connectionError" />
    <Board v-else />
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from "vuex";

import AnimatedLoader from "@/components/AnimatedLoader";
import NetworkError from "@/components/NetworkError";
import ConnectionError from "@/components/ConnectionError";
import Setup from "@/components/Setup";
import SystemErrorOverlay from "@/components/SystemErrorOverlay";
import Board from "@/components/Board";

import appConfig from "@/app-config";

export default {
  name: "app",
  components: {
    AnimatedLoader,
    NetworkError,
    ConnectionError,
    Setup,
    SystemErrorOverlay,
    Board
  },
  data: function() {
    return {
      loading: true
    };
  },
  channels: {
    UpdatesChannel: {
      connected() {},
      rejected() {},
      received(data) {
        switch (data.type) {
          case "update":
            this.handleResourceUpdate(data.payload);
            break;
          case "deletion":
            this.handleResourceDeletion(data.payload);
            break;
          default:
            throw new Error(
              "[websocket] unknown message type on UpdatesChannel"
            );
        }
      },
      disconnected() {
        //this.$store.commit("SET_NETWORK_ERROR", true);
      }
    },
    StatusChannel: {
      connected() {
        clearTimeout(this.$options.timeout);
        delete this.$options.timeout;
        this.$store.commit("SET_NETWORK_ERROR", false);
      },
      rejected() {},
      received(data) {
        this.$store.commit("SET_SYSTEMSTATUS", data.payload);
      },
      disconnected() {
        this.$options.timeout = window.setTimeout(() => {
          this.$store.commit("SET_NETWORK_ERROR", true);
        }, 30000);
      }
    }
  },
  watch: {
    language: function(newLang) {
      localStorage.language = newLang;
      this.$translate.setLang(this.language);
      document.documentElement.setAttribute("lang", this.languageTag);
    },
    backgroundcolor: function(newVal) {
      if (newVal.attributes != undefined) {
        document.body.style.backgroundColor = newVal.attributes.value;
      }
    },
    fontcolor: function(newVal) {
      if (newVal.attributes != undefined) {
        document.body.style.color = newVal.attributes.value;
      }
    },
    backgroundImage: async function(newVal) {
      if (newVal.attributes.value.length > 0) {
        const bgId = this.settings.system_backgroundimage.attributes.value;
        const data = await fetch(
          `${appConfig.backendUrl}/uploads/${bgId}`
        ).then(res => res.json());
        document.body.style.backgroundImage = `url("${data.file_url}")`;
        document.body.style.backgroundOrigin = "center center";
        document.body.style.backgroundRepeat = "no-repeat";
        document.body.style.backgroundSize = "cover";
      } else {
        let bodyStyles = document.body.style;
        bodyStyles.removeProperty("background-image");
        bodyStyles.removeProperty("background-origin");
        bodyStyles.removeProperty("background-repeat");
        bodyStyles.removeProperty("background-size");
      }
    }
  },
  computed: {
    ...mapState(["errors", "systemStatus", "networkError", "settings"]),
    ...mapGetters(["language", "languageTag", "ap_active", "connecting"]),
    backgroundcolor: function() {
      return this.settings.system_backgroundcolor;
    },
    fontcolor: function() {
      return this.settings.system_fontcolor;
    },
    backgroundImage: function() {
      return this.settings.system_backgroundimage;
    },
    showSetup: function() {
      return (
        !this.systemStatus.setup_complete ||
        !this.systemStatus.configured_at_boot
      );
    },
    connectionError: function() {
      return (
        this.systemStatus.configured_at_boot &&
        this.systemStatus.online === false &&
        this.ap_active
      );
    }
  },
  beforeMount: async function() {
    try {
      await this.fetchSystemStatus();
      await this.fetchSettings();
      this.$store.commit("SET_NETWORK_ERROR", false);
    } catch (error) {
      console.warn(error);
    } finally {
      this.loading = false;
      if (localStorage.language) {
        this.$translate.setLang(localStorage.language);
        document.documentElement.setAttribute("lang", this.languageTag);
      }
    }
  },
  mounted: function() {
    this.$cable.subscribe({ channel: "UpdatesChannel" });
    this.$cable.subscribe({ channel: "StatusChannel" });

    if (location.hash === "#preview") {
      const html = document.documentElement;
      html.classList.add("preview");
      if (window.innerWidth < 1080) {
        html.style.transform = `scale(${window.innerWidth / 1080})`;
        html.style.transformOrigin = "top left";
      }
    }
    window.setTimeout(() => {
      localStorage.removeItem("reloads");
    }, 10000);
  },
  methods: {
    ...mapActions([
      "handleResourceUpdate",
      "handleResourceDeletion",
      "fetchSystemStatus",
      "fetchSettings"
    ]),
    checkRefresh: async function() {
      try {
        await this.$store.dispatch("fetchSystemStatus");
        this.$store.commit("SET_NETWORK_ERROR", false);
      } catch (error) {
        // caught
      }
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

    @media (orientation: landscape) {
      // Columns
      @for $i from 1 through $gridstack-columns {
        &[data-gs-width="#{$i}"] {
          width: (50% / $gridstack-columns) * $i;
        }
      }
      @for $i from 1 through $gridstack-columns {
        &[data-gs-x="#{$i}"] {
          left: (50% / $gridstack-columns) * $i;
        }
      }

      // Rows
      @for $i from 1 through $gridstack-rows {
        &[data-gs-height="#{$i}"] {
          height: calc(#{100vh / round($gridstack-rows / 2) * $i} - 10px);
        }
      }

      @for $i from 1 through 10 {
        &[data-gs-y="#{$i}"] {
          top: calc(#{100vh / round($gridstack-rows / 2) * $i} - 10px);
        }
      }
      @for $i from 11 through $gridstack-rows {
        &[data-gs-y="#{$i}"] {
          margin-left: 50%;
          top: calc(#{100vh / round($gridstack-rows / 2) * ($i - 11)} - 10px);
        }
      }
      &[data-gs-y="11"] {
        top: 0;
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

.preview .grid-stack {
  height: 1900px;
  width: 1070px;
  margin: 0 auto;
  > .grid-stack-item {
    @for $i from 1 through $gridstack-rows {
      &[data-gs-height="#{$i}"] {
        height: (100% / $gridstack-rows) * $i;
      }
      &[data-gs-y="#{$i}"] {
        top: (100% / $gridstack-rows) * $i;
      }
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

.smaller {
  font-size: 80%;
}
</style>
