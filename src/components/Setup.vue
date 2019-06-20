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
