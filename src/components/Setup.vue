<template>
  <main>
    <template v-if="setupWithWiFi">
      <section class="instructions" id="wifi">
        <p>
          <span>{{ t("I made a Wi-Fi for you.") }}</span> <br />
          <span>{{ t("Connect your smartphone or laptop with me.") }}</span>
        </p>
        <p>{{ t("Wi-Fi name") }}: <b>glancr setup</b></p>
      </section>
      <hr />
    </template>

    <section class="instructions" id="browser">
      <IconBrowser />
      <p v-if="setupWithWiFi">
        <span>
          {{
            t("On most devices, the setup screen should start automatically.")
          }}
        </span>
        <br />
        <em>
          {{ t("If it doesn't, visit") }} <b>http://glancr.conf</b>
          {{ t("in your browser.") }}
        </em>
      </p>
      <div v-else>
        {{ t("Your glancr is online!") }}
        <p>
          {{ t("Scan the QR code or open") }}
          <span class="underline">api.glancr.de/setup</span>
          {{ t("in your browser") }}
        </p>
        <div>
          <QRCode content="https://api.glancr.de/setup" />
          <p class="medium">
            {{ t("Not working? Try") }}
            <span class="underline"
              >http://{{ primaryConnectionIP }}/settings</span
            >
          </p>
        </div>
      </div>
    </section>
    <hr />

    <section class="instructions" id="follow">
      <IconInstructions />
      <p>{{ t("Follow the instructions to complete the setup!") }}</p>
    </section>

    <SystemErrorOverlay v-if="systemDisconnected && !ap_active">
      <IconOffline slot="icon" />
      <template slot="title">{{ t("Can't open setup WiFi.") }}</template>
      <template slot="text">{{
        t(
          "Your glancr attempted to open the setup WiFi, but something went wrong. Please reboot the device and contact support if the problem persists."
        )
      }}</template>
    </SystemErrorOverlay>
  </main>
</template>
<script>
import { mapGetters, mapState } from "vuex";
import IconBrowser from "@/components/icons/IconBrowser.vue";
import IconInstructions from "@/components/icons/IconInstructions.vue";
import IconOffline from "@/components/icons/IconOffline.vue";
import SystemErrorOverlay from "@/components/SystemErrorOverlay.vue";
import QRCode from "./QRCode.vue";

export default {
  // eslint-disable-next-line
  name: "Setup",
  components: {
    IconBrowser,
    IconInstructions,
    IconOffline,
    SystemErrorOverlay,
    QRCode
  },
  data: function () {
    return {
      languages: ["enGb"],
    };
  },
  computed: {
    ...mapState(["settings"]),
    ...mapGetters([
      "settingOptions",
      "systemDisconnected",
      "ap_active",
      "primaryConnectionIP",
    ]),
    setupWithWiFi() {
      return this.systemDisconnected && this.ap_active;
    },
  },
  watch: {
    settings: {
      immediate: true,
      handler: function (newVal) {
        if (newVal.system_language === undefined) return;

        const opts = this.settingOptions("system_language");
        if (opts !== undefined) {
          this.languages = Object.keys(opts);
        }
        // Stop the rotation once a language has been set.
        if (newVal.system_language?.attributes?.value !== "") {
          this.$translate.setLang(newVal.system_language.attributes.value);
          clearInterval(this.$options.languageRotation);
        }
      },
    },
  },
  mounted: function () {
    this.$options.languageRotation = setInterval(this.changeLocale, 7000);
  },
  beforeDestroy: function () {
    clearInterval(this.$options.languageRotation);
  },
  methods: {
    changeLocale: function () {
      // Relies on this.languages to be cloned from Vuex store state.
      this.languages.push(this.languages.shift());
      this.$translate.setLang(this.languages[0]);
      document.documentElement.setAttribute(
        "lang",
        this.$options.filters.bcp47tag(this.languages[0])
      );
    }
  },
  locales: {
    deDe: {
      "Your glancr is online!": "Dein glancr ist online!",
      "Scan the QR code or open": "Scanne den QR-Code oder öffne",
      "in your browser": "in deinem Browser",
      "Not working? Try": "Funktioniert nicht? Probiere es mit",
    },
    frFr: {
      "Your glancr is online!": "Votre glancr est en ligne!",
      "Scan the QR code or open": "Scannez le code QR ou ouvrez",
      "in your browser": "dans votre navigateur",
      "Not working? Try": "Ca ne fonctionne pas? Essayer",
    },
    esEs: {
      "Your glancr is online!": "¡Tu glancr está en línea!",
      "Scan the QR code or open": "Escanee el código QR o abra",
      "in your browser": "en tu navegador",
      "Not working? Try": "¿No funciona? Tratar",
    },
    plPl: {
      "Your glancr is online!": "Twoje spojrzenie jest online!",
      "Scan the QR code or open": "Zeskanuj kod QR lub otwórz",
      "in your browser": "w Twojej przeglądarce",
      "Not working? Try": "Nie działa? Próbować",
    },
    koKr: {
      "Your glancr is online!": "귀하의 glancr이 온라인 상태입니다!",
      "Scan the QR code or open": "QR 코드를 스캔하거나",
      "in your browser": "브라우저에서",
      "Not working? Try": "작동 안함? 노력하다",
    },
  },
};
</script>
<style scoped lang="scss">
main {
  padding: 3rem;
  font-size: 2rem;
  line-height: 4rem;
  @media (orientation: landscape) {
    padding: 1rem;
    line-height: 2.75rem;
  }
}

section {
  text-align: center;
}

hr {
  max-width: 6rem;
  margin: 6rem auto 6rem auto;
  transform: rotate(90deg);
  @media (orientation: landscape) {
    max-width: 2rem;
    margin: 2rem auto 2rem auto;
  }
}

table {
  margin: 0 auto;
  border-spacing: 0.125rem 0.625rem;
  text-align: center;
}

td {
  padding: 0.5rem;
  background: white;
  color: black;
  border-radius: 5px 0 0 5px;
}

td:nth-of-type(2) {
  border-radius: 0 5px 5px 0;
}

.smaller {
  font-size: smaller;
}

.medium {
  font-size: medium;
}

.margin-top {
  margin-top: 2rem;
}

.underline {
  text-decoration: underline;
}

.instructions svg {
  width: 25%;
  @media (orientation: landscape) {
    width: 15%;
  }
}
</style>