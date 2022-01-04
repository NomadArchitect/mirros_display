<template>
  <div id="app" :class="{ [`font-${displayFontName}`]: displayFontName }">
    <main v-if="loading" class="spinner"><AnimatedLoader /></main>

    <main v-else-if="systemStatus.snap_refresh_status === 'pre-refresh'">
      <p class="spinner">
        <AnimatedLoader />
      </p>
      <h2 class="centered-message">
        {{ t("mirr.OS is being updated now.") }}
      </h2>
      <p class="centered-message">
        {{
          t("This can take a few minutes, please do not turn off the device.")
        }}
      </p>
    </main>

    <NetworkError v-else-if="networkError" />

    <main v-else-if="showSetup">
      <Setup />
      <SystemErrorOverlay v-if="!ap_active">
        <IconOffline slot="icon" />
        <template slot="title">{{ t("Can't open setup WiFi.") }}</template>
        <template slot="text">{{
          t(
            "Your glancr attempted to open the setup WiFi, but something went wrong. Please reboot the device and contact support if the problem persists."
          )
        }}</template>
      </SystemErrorOverlay>
    </main>

    <main v-else-if="connecting" class="spinner">
      <p style="text-align: center">{{ t("Connecting") }}</p>
      <AnimatedLoader />
    </main>

    <main v-else-if="systemStatus.resetting" class="spinner">
      <p style="text-align: center">{{ t("Reset") }}</p>
      <AnimatedLoader />
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
import IconOffline from "@/components/icons/IconOffline.vue";

export default {
  name: "App",
  components: {
    AnimatedLoader,
    NetworkError,
    ConnectionError,
    IconOffline,
    Setup,
    SystemErrorOverlay,
    Board,
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
      async connected() {
        try {
          // Update status and settings info on (re)connect to ensure we have the latest.
          // TODO: Refactor as websocket request for consistency.
          await this.fetchSystemStatus();
          await this.fetchSettings();
          document.documentElement.setAttribute("lang", this.languageTag);

          // Ensure we don't trigger a timeout once connected.
          this.clearNetworkErrorTimeout();
          this.loading = false;
          this.sendCurrentDisplayLayout();
          this.$store.commit("SET_NETWORK_ERROR", false);
        } catch (error) {
          this.$store.commit("SET_NETWORK_ERROR", true);
        }
      },
      rejected() {},
      received(data) {
        this.$store.commit("SET_SYSTEMSTATUS", data.payload);
      },
      disconnected() {
        this.startNetworkErrorTimeout(30000);
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
        document.body.style.fill = newVal.attributes.value;
      }
    },
    "systemStatus.client_display": function (newVal) {
      if (newVal) {
        // Ensure the preview mode shows properly on any screen size.
        if (this.runsInPreviewMode) {
          const displaySize = this.systemStatus.client_display;
          const html = document.documentElement;
          html.classList.add("preview");
          html.style.width = `${displaySize.width}px`;
          html.style.height = `${displaySize.height}px`;

          if (window.innerWidth < displaySize.width) {
            html.style.transform = `scale(${
              window.innerWidth / displaySize.widthBoard
            })`;
            html.style.transformOrigin = "top left";
          }
        }
      }
    },
  },
  computed: {
    ...mapState(["errors", "systemStatus", "networkError", "settings"]),
    ...mapGetters([
      "language",
      "languageTag",
      "ap_active",
      "connecting",
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
     * Check if the backend has no network connection.
     * @returns {boolean} if there is a connection error.
     */
    connectionError() {
      return this.systemStatus.network.primary_connection === null;
    },
    /**
     * Check whether the app is running in preview mode.
     * @returns {boolean} Whether the app is in preview mode.
     */
    runsInPreviewMode() {
      return window.location.hash === "#preview";
    },
  },
  beforeMount() {
    // Start websocket subscription as early as possible, as these do not return promises.
    this.$cable.subscribe({ channel: "StatusChannel" });
    this.$cable.subscribe({ channel: "UpdatesChannel" });

    // Use localStorage.language to set the locale before we render anything.
    if (localStorage.language) {
      this.$translate.setLang(localStorage.language);
    }
  },
  mounted() {
    // Reset the reload counter after 10s, i.e. there are no fatal errors.
    window.setTimeout(() => {
      localStorage.removeItem("reloads");
    }, 10000);

    // Ensure the app doesn't hang on loading state when the backend is unreachable.
    window.setTimeout(() => {
      if (this.$cable._cable.connection.disconnected) {
        this.loading = false;
        this.$store.commit("SET_NETWORK_ERROR", true);
      }
    }, 15000);
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
  // FIXME: Move to POEditor project once we have more strings available.
  locales: {
    deDe: {
      "mirr.OS is being updated now.": "mirr.OS wird jetzt aktualisiert",
      "This can take a few minutes, please do not turn off the device.":
        "Das kann ein paar Minuten dauern, bitte das Gerät nicht ausschalten.",
    },
    frFr: {
      "mirr.OS is being updated now.": "mirr.OS est en cours de mise à jour.",
      "This can take a few minutes, please do not turn off the device.":
        "Cela peut prendre quelques minutes, veuillez ne pas éteindre l'appareil.",
    },
    esEs: {
      "mirr.OS is being updated now.": "mirr.OS se está actualizando ahora.",
      "This can take a few minutes, please do not turn off the device.":
        "Esto puede tardar unos minutos, no apague el dispositivo.",
    },
    plPl: {
      "mirr.OS is being updated now.": "mirr.OS jest teraz aktualizowany.",
      "This can take a few minutes, please do not turn off the device.":
        "Może to zająć kilka minut, nie wyłączaj urządzenia.",
    },
    koKr: {
      "mirr.OS is being updated now.": "mirr.OS는 현재 업데이트 중입니다.",
      "This can take a few minutes, please do not turn off the device.":
        "이 작업은 몇 분 정도 소요될 수 있습니다. 장치를 끄지 마십시오.",
    },
  },
};
</script>
<style>
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
