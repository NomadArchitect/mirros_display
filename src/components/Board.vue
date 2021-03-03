<template>
  <main id="board">
    <section class="grid-stack" v-if="activeBoard">
      <WidgetInstanceWrapper
        v-for="widgetInstance in widgetInstancesForActiveBoard"
        :key="widgetInstance.id"
        class="grid-stack-item"
        :widgetInstance="widgetInstance"
        :languageTag="languageTag"
      />
    </section>

    <SystemErrorOverlay v-if="systemDisconnected && showErrorNotifications">
      <OfflineIcon slot="icon" />
      <template slot="title">{{ t("Your glancr is offline.") }}</template>
      <template slot="text">{{
        t(
          "mirr.OS is connected to your network, but cannot reach the internet. Please check your router if the internet connection is active."
        )
      }}</template>
    </SystemErrorOverlay>
  </main>
</template>

<script>
import WidgetInstanceWrapper from "@/components/WidgetInstanceWrapper";
import SystemErrorOverlay from "@/components/SystemErrorOverlay";
import OfflineIcon from "@/assets/icons/offline.svg";
import { mapState, mapGetters, mapActions } from "vuex";

export default {
  name: "Board",
  components: {
    WidgetInstanceWrapper,
    OfflineIcon,
    SystemErrorOverlay,
  },
  watch: {
    activeBoardId: {
      immediate: true,
      handler: async function () {
        await this.fetchActiveBoard();
      },
    },
    backgroundImage: {
      immediate: true,
      handler: async function (newVal) {
        await this.$nextTick();
        const board = document.getElementById("board");

        board.style.backgroundImage = newVal ? `url("${newVal}")` : "none";
        board.style.backgroundOrigin = "center center";
        board.style.backgroundRepeat = "no-repeat";
        board.style.backgroundSize = "cover";
      },
    },
  },
  computed: {
    ...mapState(["boards", "widgetInstances"]),
    ...mapGetters([
      "activeBoardId",
      "systemDisconnected",
      "languageTag",
      "showErrorNotifications",
      "backgroundImage",
    ]),
    activeBoard: function () {
      return this.boards[this.activeBoardId];
    },
    widgetInstancesForActiveBoard: function () {
      // TODO: Maybe this can be cleaner.
      const reducer = (acc, ref) => {
        acc[ref.id] = this.widgetInstances[ref.id];
        return acc;
      };

      return (
        this.activeBoard.relationships.widgetInstances.data.reduce(
          reducer,
          {}
        ) ?? {}
      );
    },
  },
  methods: {
    ...mapActions(["fetchActiveBoard"]),
  },
};
</script>

<style>
.grid-stack {
  display: grid;
  grid-template-columns: repeat(var(--gridstack-columns), 1fr);
  grid-template-rows: repeat(var(--gridstack-rows), 1fr);
  gap: var(--grid-gap);
  height: 100vh;
  padding: 1.042vh 0.463vw 1.042vh 0.463vw;
}

@media (orientation: landscape) {
  .grid-stack {
    padding: 0.463vh 1.042vw 0.463vh 1.042vw;
  }
}
</style>
