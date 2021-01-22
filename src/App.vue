<template>
  <div id="app" :class="{ [`font-${displayFontName}`]: displayFontName }">
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
    <Board v-else-if="activeBoardId" />
    <p class="centered-message" v-else>{{ t("No active board") }}</p>
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
import OfflineIcon from "@/assets/icons/offline.svg";

export default {
  name: "app",
  components: {
    AnimatedLoader,
    NetworkError,
    ConnectionError,
    Setup,
    SystemErrorOverlay,
    Board,
    OfflineIcon,
  },
  data: function () {
    return {
      loading: true,
    };
  },
  timeout: undefined,
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
      disconnected() {},
    },
    StatusChannel: {
      connected() {
        clearTimeout(this.$options.timeout);
        delete this.$options.timeout;
        this.$store.commit("SET_NETWORK_ERROR", false);
        this.sendCurrentDisplayLayout();
      },
      rejected() {},
      received(data) {
        this.$store.commit("SET_SYSTEMSTATUS", data.payload);
      },
      disconnected() {
        this.$options.timeout = window.setTimeout(() => {
          this.$store.commit("SET_NETWORK_ERROR", true);
        }, 30000);
      },
    },
  },
  watch: {
    language: function (newLang) {
      localStorage.language = newLang;
      this.$translate.setLang(this.language);
      document.documentElement.setAttribute("lang", this.languageTag);
    },
    backgroundcolor: function (newVal) {
      if (newVal.attributes != undefined) {
        document.body.style.backgroundColor = newVal.attributes.value;
      }
    },
    fontcolor: function (newVal) {
      if (newVal.attributes != undefined) {
        document.body.style.color = newVal.attributes.value;
      }
    },
    backgroundImage: {
      immediate: true,
      handler: function (newVal) {
        document.body.style.backgroundImage = newVal
          ? `url("${newVal}")`
          : "none";
        document.body.style.backgroundOrigin = "center center";
        document.body.style.backgroundRepeat = "no-repeat";
        document.body.style.backgroundSize = "cover";
      },
    },
  },
  computed: {
    ...mapState(["errors", "systemStatus", "networkError", "settings"]),
    ...mapGetters([
      "language",
      "languageTag",
      "ap_active",
      "connecting",
      "backgroundImage",
      "activeBoardId",
    ]),
    backgroundcolor() {
      return this.settings.system_backgroundcolor;
    },
    fontcolor() {
      return this.settings.system_fontcolor;
    },
    /**
     * Retrieves the name of the currently selected display font.
     * @returns {string} The current display font name per the system setting's `options` attribute, or 'alegreya' if falsy.
     */
    displayFontName() {
      return this.settings.system_displayfont?.attributes.value || "alegreya";
    },
    /**
     * Determines if the setup screen should be shown.
     * @returns {boolean}
     */
    showSetup() {
      return (
        (!this.systemStatus.setup_complete ||
          !this.systemStatus.configured_at_boot) &&
        !this.connecting
      );
    },
    /**
     * Determines if there is a connection error to the backend.
     * @returns {boolean} if there is a connection error.
     */
    connectionError() {
      return (
        this.systemStatus.configured_at_boot &&
        this.systemStatus.online === false &&
        this.ap_active
      );
    },
    /**
     * Check whether the app is running in preview mode.
     * @returns {boolean} Whether the app is in preview mode.
     */
    runsInPreviewMode() {
      return window.location.hash === "#preview";
    },
  },
  beforeMount: async function () {
    try {
      await this.fetchSystemStatus();
      await this.fetchSettings();
      this.$store.commit("SET_NETWORK_ERROR", false);
    } catch (error) {
      // console.warn(error);
    } finally {
      this.loading = false;
      if (localStorage.language) {
        this.$translate.setLang(localStorage.language);
        document.documentElement.setAttribute("lang", this.languageTag);
      }
    }
  },
    this.$cable.subscribe({ channel: "UpdatesChannel" });
  mounted() {
    this.$cable.subscribe({ channel: "StatusChannel" });

    if (this.runsInPreviewMode) {
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
      "fetchSettings",
    ]),
    /**
     * Sends the current screen orientation, width and height to the via ActionCable.
     */
    sendCurrentDisplayLayout() {
      // Avoid sending incorrect info when viewed in preview mode.
      if (this.runsInPreviewMode) return;

      this.$cable.perform({
        channel: "StatusChannel",
        action: "client_display",
        data: {
          orientation:
            window.innerWidth / window.innerHeight > 1
              ? "landscape"
              : "portrait",
          width: window.innerWidth,
          height: window.innerHeight,
        },
      });
    },
    /**
     * Starts a timeout to activate the networkError state.
     * @param {number} milliseconds The time in ms until state is changed.
     */
    startNetworkErrorTimeout(milliseconds) {
      this.$options.timeout = window.setTimeout(() => {
        this.$store.commit("SET_NETWORK_ERROR", true);
      }, milliseconds);
    },
    /**
     * Stops the timeout to activate the networkError state.
     */
    clearNetworkErrorTimeout() {
      this.$options.timeout = window.clearTimeout(this.$options.timeout);
    },
  },
};
</script>

<style lang="scss">
$gridstack-columns-portrait: 12 !default;
$gridstack-rows-portrait: 21.33333 !default;

$gridstack-columns-landscape: 21.33333 !default;
$gridstack-rows-landscape: 12 !default;

$horizontal_padding: 20px !default;
$vertical_padding: 20px !default;

.grid-stack {
  position: relative;
  margin: 5px;
  > .grid-stack-item {
    min-width: 100% / $gridstack-columns-portrait;
    position: absolute;
    padding: 0;

    @for $i from 1 through $gridstack-columns-portrait {
      &[data-gs-width="#{$i}"] {
        width: (100% / $gridstack-columns-portrait) * $i;
      }
      &[data-gs-x="#{$i}"] {
        left: (100% / $gridstack-columns-portrait) * $i;
      }
    }

    @for $i from 1 through $gridstack-rows-portrait {
      &[data-gs-height="#{$i}"] {
        height: (100vh / $gridstack-rows-portrait) * $i;
      }
      &[data-gs-y="#{$i}"] {
        top: (100vh / $gridstack-rows-portrait) * $i;
      }
    }

    @media (orientation: landscape) {
      // Columns
      @for $i from 1 through $gridstack-columns-landscape {
        &[data-gs-width="#{$i}"] {
          width: (100% / $gridstack-columns-landscape) * $i;
        }
      }
      @for $i from 1 through $gridstack-columns-landscape {
        &[data-gs-x="#{$i}"] {
          left: (100% / $gridstack-columns-landscape) * $i;
        }
      }

      // Rows
      @for $i from 1 through $gridstack-rows-landscape {
        &[data-gs-height="#{$i}"] {
          height: (100vh / $gridstack-rows-landscape) * $i;
        }
        &[data-gs-y="#{$i}"] {
          top: (100vh / $gridstack-rows-landscape) * $i;
        }
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
  margin: 0 auto;
  height: 1900px;
  width: 1070px;
  > .grid-stack-item {
    @for $i from 1 through $gridstack-rows-portrait {
      &[data-gs-height="#{$i}"] {
        height: (100% / $gridstack-rows-portrait) * $i;
      }
      &[data-gs-y="#{$i}"] {
        top: (100% / $gridstack-rows-portrait) * $i;
      }
    }
  }

  @media (orientation: landscape) {
    height: 1070px;
    width: 1900px;
    > .grid-stack-item {
      @for $i from 1 through $gridstack-rows-landscape {
        &[data-gs-height="#{$i}"] {
          height: (100% / $gridstack-rows-landscape) * $i;
        }
        &[data-gs-y="#{$i}"] {
          top: (100% / $gridstack-rows-landscape) * $i;
        }
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
