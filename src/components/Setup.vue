<template>
  <article>
    <section class="instructions" id="wifi">
      <p>
        <span>{{ t("I made a Wi-Fi for you.") }}</span> <br />
        <span>{{ t("Connect your smartphone or laptop with me.") }}</span>
      </p>
      <p>{{ t("Wi-Fi name") }}: <b>glancr setup</b></p>
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
    </section>
    <hr />

    <section class="instructions" id="follow">
      <InstructionsIcon />
      <p>{{ t("Follow the instructions to complete the setup!") }}</p>
    </section>
  </article>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import BrowserIcon from "@/assets/icons/http.svg";
import InstructionsIcon from "@/assets/icons/instructions.svg";

export default {
  name: "Setup",
  components: {
    BrowserIcon,
    InstructionsIcon,
  },
  data: function () {
    return {
      languages: [],
    };
  },
  computed: {
    ...mapState(["settings"]),
    ...mapGetters(["settingOptions"]),
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
    },
  },
};
</script>
<style scoped lang="scss">
article {
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

.margin-top {
  margin-top: 2rem;
}

.instructions svg {
  width: 25%;
  @media (orientation: landscape) {
    width: 15%;
  }
}
</style>
