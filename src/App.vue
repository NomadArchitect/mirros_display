<template>
  <div id="app">
    <main v-if="loading" class="spinner"><AnimatedLoader /></main>

    <main v-else-if="networkError" class="centered-message">
      <h4>{{ t("Connecting to the server.") }}</h4>
      <p>
        {{
          t(
            "If you keep seeing this message after a few minutes, please restart the device. If that doesn't help, please contact support."
          )
        }}
      </p>
      <span class="smaller"
        >{{ t("Attempting connection in") }} {{ countdown }}s &hellip;</span
      >
    </main>

    <main
      v-else-if="
        !systemStatus.setup_complete || !systemStatus.configured_at_boot
      "
    >
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

    <main
      v-else-if="
        systemStatus.configured_at_boot &&
          (systemStatus.online === false && ap_active)
      "
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

      <SystemErrorOverlay v-if="systemDisconnected">
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

import appConfig from "@/app-config";

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
      countdown: 5,
      retries: 1
    };
  },
  channels: {
    UpdatesChannel: {
      connected() {},
      rejected() {},
      received(data) {
        switch (data.type) {
          case "update":
            this.$store.dispatch("handleResourceUpdate", data.payload);
            break;
          case "deletion":
            this.$store.dispatch("handleResourceDeletion", data.payload);
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
    networkError: function(val) {
      if (val === true) {
        this.$options.countdown = setInterval(this.doCountdown, 1000);
      } else {
        clearInterval(this.$options.countdown);
      }
    },
    systemStatus: function(newVal) {
      if (newVal.setup_complete) {
        this.$translate.setLang(this.language);
        document.documentElement.setAttribute("lang", this.languageTag());
      }
    },
    language: function(newLang) {
      localStorage.language = newLang;
      this.$translate.setLang(this.language);
      document.documentElement.setAttribute("lang", this.languageTag());
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
    ...mapState([
      "errors",
      "widgetInstances",
      "systemStatus",
      "networkError",
      "settings"
    ]),
    ...mapGetters([
      "language",
      "ap_active",
      "systemDisconnected",
      "connecting"
    ]),
    backgroundcolor: function() {
      return this.settings.system_backgroundcolor;
    },
    fontcolor: function() {
      return this.settings.system_fontcolor;
    },
    backgroundImage: function() {
      return this.settings.system_backgroundimage;
    }
  },
  beforeMount: async function() {
    try {
      await this.$store.dispatch("fetchSystemStatus");
      await this.fetchData();
    } catch (error) {
      // caught
    } finally {
      this.loading = false;
      if (localStorage.language) {
        this.$translate.setLang(localStorage.language);
        document.documentElement.setAttribute("lang", this.languageTag());
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
  beforeDestroy: function() {
    clearInterval(this.$options.countdown);
  },
  methods: {
    checkRefresh: async function() {
      try {
        await this.$store.dispatch("fetchSystemStatus");
        this.$store.commit("SET_NETWORK_ERROR", false);
      } catch (error) {
        // caught
      }
    },
    fetchData: async function() {
      try {
        await this.$store.dispatch("fetchFullData");
        this.$store.commit("SET_NETWORK_ERROR", false);
      } catch (error) {
        // caught
      }
    },
    doCountdown: async function() {
      if (this.countdown > 0) {
        this.countdown--;
      } else {
        this.retries++;
        this.countdown = this.retries * 5;
        // Retry async status fetch
      }
    },
    /**
     * Formats the internal camelCase language tag as BCP 47
     * compliant (e. g. `en-GB`). Returns `en-GB` if the language is not set.
     */
    languageTag: function() {
      if (this.language.length === 0 && !localStorage.language) return "en-GB";
      const language =
        this.language.length > 0 ? this.language : localStorage.language;

      const regex = new RegExp(/([A-Z]{1}[a-z]{1})/g);
      return language.replace(regex, match => {
        return match.toUpperCase().padStart(match.length + 1, "-");
      });
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
