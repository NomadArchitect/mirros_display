<template>
  <main>
    <section class="grid-stack" v-if="activeBoard">
      <div
        v-for="widgetInstance in widgetInstancesForActiveBoard"
        :key="widgetInstance.id"
        class="grid-stack-item"
        :data-gs-x="widgetInstance.attributes.position.x"
        :data-gs-y="widgetInstance.attributes.position.y"
        :data-gs-width="widgetInstance.attributes.position.width"
        :data-gs-height="widgetInstance.attributes.position.height"
      >
        <WidgetInstanceWrapper
          :widgetInstance="widgetInstance"
          :languageTag="languageTag"
        />
      </div>
    </section>

    <SystemErrorOverlay v-if="systemDisconnected">
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
    SystemErrorOverlay
  },
  watch: {
    activeBoardId: {
      immediate: true,
      handler: async function() {
        await this.fetchActiveBoard();
      }
    }
  },
  computed: {
    ...mapState(["boards", "widgetInstances"]),
    ...mapGetters(["activeBoardId", "systemDisconnected", "languageTag"]),
    activeBoard: function() {
      return this.boards[this.activeBoardId];
    },
    widgetInstancesForActiveBoard: function() {
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
    }
  },
  methods: {
    ...mapActions(["fetchActiveBoard"])
  }
};
</script>

<style></style>
