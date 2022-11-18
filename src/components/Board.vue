<template>
  <main id="board">
    <OwmConditionIcons></OwmConditionIcons>
    <section
      class="grid-stack"
      v-if="activeBoard"
      :style="{
        gridTemplateColumns: `repeat(${dynamicGrid.columns}, 80px)`,
        gridTemplateRows: `repeat(${dynamicGrid.rows}, 80px)`,
        maxWidth: `${dynamicGrid.maxWidth}px`,
        maxHeight: `${dynamicGrid.maxHeight}px`,
      }"
    >
      <WidgetInstanceWrapper
        v-for="widgetInstance in widgetInstancesForActiveBoard"
        :key="widgetInstance.id"
        class="grid-stack-item"
        :widgetInstance="widgetInstance"
        :languageTag="languageTag"
      />
    </section>

    <SystemErrorOverlay v-if="systemDisconnected && showErrorNotifications">
      <template slot="icon">
        <IconOffline />
      </template>
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
import WidgetInstanceWrapper from "./WidgetInstanceWrapper.vue";
import SystemErrorOverlay from "./SystemErrorOverlay.vue";
import OwmConditionIcons from "./OwmConditionIcons.vue";
import IconOffline from "./icons/IconOffline.vue";
import { mapState, mapGetters, mapActions } from "vuex";

export default {
  // eslint-disable-next-line
  name: "Board",
  components: {
    IconOffline,
    OwmConditionIcons,
    SystemErrorOverlay,
    WidgetInstanceWrapper,
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
    ...mapState(["boards", "widgetInstances", "systemStatus"]),
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
    dynamicGrid() {
      let displayWidth;
      let displayHeight;
      if (window.location.hash === "#preview") {
        displayWidth = this.systemStatus.client_display.width;
        displayHeight = this.systemStatus.client_display.height;
      } else {
        displayWidth = window.innerWidth;
        displayHeight = window.innerHeight;
      }

      // 80px cell width + 10px gutter. We add 10px to the available space to account for an imagined outer gutter.
      const cellSize = 90;
      const columns = Math.floor((displayWidth + 10) / cellSize);
      const rows = Math.floor((displayHeight + 10) / cellSize);
      const gridMaxWidth = displayWidth - ((displayWidth + 10) % cellSize);
      const gridMaxHeight = displayHeight - ((displayHeight + 10) % cellSize);

      return {
        rows: rows,
        columns: columns,
        maxWidth: gridMaxWidth,
        maxHeight: gridMaxHeight,
      };
    },
    widgetInstancesForActiveBoard: function () {
      // TODO: Maybe this can be cleaner.
      const reducer = (acc, ref) => {
        acc[ref.id] = this.widgetInstances[ref.id];
        return acc;
      };

      return (
        this.activeBoard.relationships.widgetInstances.data.reduce(reducer, {}) ?? {}
      );
    },
  },
  methods: {
    ...mapActions(["fetchActiveBoard"]),
  },
};
</script>

<style>
#board {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.preview #board {
  height: 100%;
  width: 100%;
}

.grid-stack {
  display: grid;
  gap: var(--grid-gap);
  /* Default values, overridden in style attribute */
  grid-template-columns: repeat(var(--gridstack-columns), 1fr);
  grid-template-rows: repeat(var(--gridstack-rows), 1fr);
}
</style>
