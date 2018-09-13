<template>
    <article>
      <section class="instructions" id="wifi">
        <p>
          <span>{{ t("I made a Wi-Fi for you.")}}</span>
          <br>
          <span>{{t("Connect your smartphone or laptop with me.")}}</span>
        </p>
        <p>{{t("Wi-Fi name")}}: <code>glancr</code></p>
        
        <p class="smaller" id="connected">
          <span>{{t("Connected")}}</span>: <span id="connected-device"></span>
        </p>

        <!-- <img src="@/assets/icons/connecting.svg" width="75px" class="margin-top"/> -->
      </section>
      <hr>

      <section class="instructions" id="browser">
          <img src="@/assets/icons/http.svg" width="150" height="auto" alt="">
          <p>
              <span>{{t("On most devices, the setup screen should start automatically.")}}</span>
              <br>
              <em>{{t("If it doesn't, visit http://glancr.conf in your browser.")}}</em>
          </p>

          <!-- <img src="@/assets/icons/connecting.svg" width="75px" class="margin-top"/> -->
      </section>
        <hr>


      <section class="instructions" id="follow">
          <img src="@/assets/icons/instructions.svg" width="150" height="auto" alt="">
          <p>{{t("Follow the instructions to complete the setup!")}}</p>
      </section>

    </article>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "Setup",

  computed: {
    ...mapState(["settings"]),
    languages() {
      return Object.keys(
        this.settings.system_language.attributes.options
      ).slice(0);
    }
  },

  // TODO: Move translations to global Vue.locales once a PO=>JSON pipeline is ready.
  locales: {
    deDe: {
      "I made a Wi-Fi for you.": "Ich habe ein WLAN für dich erstellt.",
      "Connect your smartphone or laptop with me.":
        "Verbinde dein Smartphone oder Laptop mit mir.",
      Connected: "Verbunden",
      "On most devices, the setup screen should start automatically.":
        "Auf den meisten Geräten sollte die Einrichtung automatisch starten.",
      "If it doesn't, visit http://glancr.conf in your browser.":
        "Falls nicht, rufe http://glancr.conf in deinem Browser auf.",
      "Follow the instructions to complete the setup!":
        "Folge den Anweisungen, um die Einrichtung abzuschließen!"
    },
    frFr: {
      "I made a Wi-Fi for you.": "J'ai creé un WLAN pour toi.",
      "Connect your smartphone or laptop with me.":
        "Relie ton smartphone ou ton portable.",
      Connected: "Lié",
      "On most devices, the setup screen should start automatically.": "TODO",
      "Follow the instructions to complete the setup": "TODO"
    }
  },

  mounted: function() {
    this.$translate.setLang("enGb");
    window.setInterval(this.changeLocale, 5000);
  },
  methods: {
    changeLocale: function() {
      // Relies on this.languages to be cloned
      this.languages.push(this.languages.shift());
      this.$translate.setLang(this.languages[0]);
    }
  }
};
</script>
<style scoped>
article {
  padding: 3rem;
}

section {
  text-align: center;
}

hr {
  max-width: 3rem;
  margin: 3rem auto 3rem auto;
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
</style>
