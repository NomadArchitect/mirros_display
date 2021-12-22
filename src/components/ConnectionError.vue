<template>
  <main class="centered-message">
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
</template>

<script>
import ErrorIcon from "../assets/icons/error.svg";

export default {
  name: "ConnectionError",
  components: {
    ErrorIcon,
  },
};
</script>

<style>
.error__icon {
  width: 15rem;
}
</style>
