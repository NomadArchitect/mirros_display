<template>
  <main class="centered-message">
    <IconError />
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
import IconError from "./icons/IconError.vue";
import IconOffline from "@/components/icons/IconOffline.vue";
import SystemErrorOverlay from "@/components/SystemErrorOverlay.vue";
import { mapGetters } from "vuex";

export default {
  name: "ConnectionError",
  components: {
    IconError,
    IconOffline,
    SystemErrorOverlay,
  },
  computed: {
    ...mapGetters(["systemDisconnected", "ap_active"]),
  },
};
</script>

<style>
.error__icon {
  width: 15rem;
}
</style>
