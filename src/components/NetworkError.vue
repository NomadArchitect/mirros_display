<template>
  <main class="centered-message">
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
</template>

<script>
export default {
  name: "NetworkError",

  beforeDestroy: function () {
    clearInterval(this.countdownId);
  },
  mounted: function () {
    this.countdownId = window.setInterval(this.doCountdown, 1000);
  },
  data: function () {
    return {
      countdownId: undefined,
      countdown: 5,
      retries: 1,
    };
  },
  methods: {
    doCountdown: async function () {
      if (this.countdown > 0) {
        this.countdown--;
      } else {
        this.retries++;
        this.countdown = this.retries * 5;
      }
    },
  },
};
</script>

<style></style>
