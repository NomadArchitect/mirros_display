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
  </main>
</template>

<script>
import IconError from "./icons/IconError.vue";

export default {
  name: "ConnectionError",
  components: {
    IconError,
  },
};
</script>

<style>
.error__icon {
  width: 15rem;
}
</style>
