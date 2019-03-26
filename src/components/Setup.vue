<template>
  <article>
    <section class="instructions" id="wifi">
      <p>
        <span>{{ t("I made a Wi-Fi for you.") }}</span> <br />
        <span>{{ t("Connect your smartphone or laptop with me.") }}</span>
      </p>
      <p>{{ t("Wi-Fi name") }}: <b>glancr setup</b></p>

      <!--
        <p class="smaller" id="connected">
          <span>{{t("Connected")}}</span>: <span id="connected-device"></span>
        </p>
      -->

      <!--
        <img src="@/assets/icons/connecting.svg" width="75px" class="margin-top" />
      -->
    </section>
    <hr />

    <section class="instructions" id="browser">
      <BrowserIcon />
      <p>
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

      <!--
        <img src="@/assets/icons/connecting.svg" width="75px" class="margin-top"/>
      -->
    </section>
    <hr />

    <section class="instructions" id="follow">
      <InstructionsIcon />
      <p>{{ t("Follow the instructions to complete the setup!") }}</p>
    </section>
  </article>
</template>

<script>
import { mapState } from "vuex";
import BrowserIcon from "@/assets/icons/http.svg";
import InstructionsIcon from "@/assets/icons/instructions.svg";

export default {
  name: "Setup",
  components: {
    BrowserIcon,
    InstructionsIcon
  },
  data: function() {
    return {
      languages: []
    };
  },
  computed: {
    ...mapState(["settings"])
  },
  // TODO: Move translations to global Vue.locales once a PO=>JSON pipeline is ready.
  locales: {
    deDe: {
      "I made a Wi-Fi for you.": "Ich habe ein WLAN für dich erstellt.",
      "Connect your smartphone or laptop with me.":
        "Verbinde dein Smartphone oder Laptop mit mir.",
      "Wi-Fi name": "WLAN-Name",
      Connected: "Verbunden",
      "On most devices, the setup screen should start automatically.":
        "Auf den meisten Geräten sollte die Einrichtung automatisch starten.",
      "If it doesn't, visit": "Falls nicht, rufe",
      "in your browser.": "in deinem Browser auf.",
      "Follow the instructions to complete the setup!":
        "Folge den Anweisungen, um die Einrichtung abzuschließen!"
    },
    frFr: {
      "I made a Wi-Fi for you.": "J'ai creé un WLAN pour toi.",
      "Connect your smartphone or laptop with me.":
        "Relie ton smartphone ou ton portable.",
      "Wi-Fi name": "nom wi-fi",
      Connected: "Lié",
      "On most devices, the setup screen should start automatically.":
        "Normalement, la configuration devrait démarrer automatiquement.",
      "If it doesn't, visit": "Si ce n'est pas le cas, visitez",
      "in your browser.": "dans votre navigateur",
      "Follow the instructions to complete the setup!":
        "Suivez les instructions pour terminer l'installation!"
    },
    esEs: {
      "I made a Wi-Fi for you.": "Hice una Wi-Fi para ti.",
      "Connect your smartphone or laptop with me.":
        "Conecta tu smartphone o portátil conmigo.",
      "Wi-Fi name": "Nombre Wi-Fi",
      Connected: "Conectado",
      "On most devices, the setup screen should start automatically.":
        "En la mayoría de los dispositivos, la pantalla de configuración debería iniciarse automáticamente.",
      "If it doesn't, visit": "Si no lo hace, visite",
      "in your browser.": "en su navegador.",
      "Follow the instructions to complete the setup!":
        "Siga las instrucciones para completar la configuración!"
    },
    plPl: {
      "I made a Wi-Fi for you.": "Stworzyłem Wi-Fi dla Ciebie.",
      "Connect your smartphone or laptop with me.":
        "Połącz ze mną swój smartfon lub laptop.",
      "Wi-Fi name": "Nazwa Wi-Fi",
      Connected: "Podłączone",
      "On most devices, the setup screen should start automatically.":
        "W większości urządzeń ekran ustawień powinien uruchamiać się automatycznie.",
      "If it doesn't, visit": "Jeśli tak nie jest, odwiedź stronę",
      "in your browser.": "w swojej przeglądarce.",
      "Follow the instructions to complete the setup!":
        "Postępuj zgodnie z instrukcjami, aby zakończyć konfigurację!"
    },
    koKr: {
      "I made a Wi-Fi for you.": "설정을 위한 Wi-Fi를 생성하였습니다",
      "Connect your smartphone or laptop with me.":
        "스마트폰이나 노트북으로 Wi-Fi에 연결해 주세요",
      "Wi-Fi name": "Wi-Fi 이름",
      Connected: "연결되었습니다",
      "On most devices, the setup screen should start automatically.":
        "대부분의 디바이스에서는 자동으로 설정화면이 나타납니다.",
      "If it doesn't, visit":
        "만약 설정화면이 나타나지 않는다면 에 연결해주세요 ",
      "in your browser.": "브라우저에서.",
      "Follow the instructions to complete the setup!":
        "설정을 완료하기 위한 지시에 따라주세요!"
    }
    // jaJp: {
    //   "I made a Wi-Fi for you.": "専用Wi-Fiを設定しました。",
    //   "Connect your smartphone or laptop with me.":
    //     "スマートフォンまたはパソコンを接続してください。",
    //   "Wi-Fi name": "Wi-Fiの名前は",
    //    Connected: "",
    //   "On most devices, the setup screen should start automatically.":
    //     "接続後、通常であればセットアップが自動で始まります。",
    //   "If it doesn't, visit": "もし始まらない場合は、",
    //   "in your browser.": "にアクセスしてください。",
    //   "Follow the instructions to complete the setup!":
    //     "指示に従えばセットアップは完了します。"
    // }
  },

  mounted: function() {
    this.languages = Object.keys(
      this.settings.system_language.attributes.options
    ).slice(0);
    this.$options.interval = setInterval(this.changeLocale, 7000);
  },
  beforeDestroy: function() {
    clearInterval(this.$options.interval);
  },
  methods: {
    changeLocale: function() {
      // Rotating languages relies on this.languages to be cloned
      this.languages.push(this.languages.shift());
      this.$translate.setLang(this.languages[0]);
      document.documentElement.setAttribute(
        "lang",
        this.$options.filters.bcp47tag(this.languages[0])
      );
    }
  }
};
</script>
<style scoped>
article {
  padding: 3rem;
  font-size: 2rem;
  line-height: 4rem;
}

section {
  text-align: center;
}

hr {
  max-width: 6rem;
  margin: 6rem auto 6rem auto;
  transform: rotate(90deg);
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

.margin-top {
  margin-top: 2rem;
}

.instructions svg {
  width: 25%;
}
</style>
