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
  },
  computed: {
    ...mapState(["boards", "widgetInstances"]),
    ...mapGetters([
      "activeBoardId",
      "systemDisconnected",
      "languageTag",
      "showErrorNotifications",
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

<style lang="scss">
$gridstack-columns-portrait: 12 !default;
$gridstack-rows-portrait: 21.33333 !default;

$gridstack-columns-landscape: 21.33333 !default;
$gridstack-rows-landscape: 12 !default;

$horizontal_padding: 20px !default;
$vertical_padding: 20px !default;

.grid-stack {
  position: relative;
  margin: 5px;
  > .grid-stack-item {
    min-width: 100% / $gridstack-columns-portrait;
    position: absolute;
    padding: 0;

    @for $i from 1 through $gridstack-columns-portrait {
      &[data-gs-width="#{$i}"] {
        width: (100% / $gridstack-columns-portrait) * $i;
      }
      &[data-gs-x="#{$i}"] {
        left: (100% / $gridstack-columns-portrait) * $i;
      }
    }

    @for $i from 1 through $gridstack-rows-portrait {
      &[data-gs-height="#{$i}"] {
        height: (100vh / $gridstack-rows-portrait) * $i;
      }
      &[data-gs-y="#{$i}"] {
        top: (100vh / $gridstack-rows-portrait) * $i;
      }
    }

    @media (orientation: landscape) {
      // Columns
      @for $i from 1 through $gridstack-columns-landscape {
        &[data-gs-width="#{$i}"] {
          width: (100% / $gridstack-columns-landscape) * $i;
        }
      }
      @for $i from 1 through $gridstack-columns-landscape {
        &[data-gs-x="#{$i}"] {
          left: (100% / $gridstack-columns-landscape) * $i;
        }
      }

      // Rows
      @for $i from 1 through $gridstack-rows-landscape {
        &[data-gs-height="#{$i}"] {
          height: (100vh / $gridstack-rows-landscape) * $i;
        }
        &[data-gs-y="#{$i}"] {
          top: (100vh / $gridstack-rows-landscape) * $i;
        }
      }
    }

    > .grid-stack-item-content {
      margin: $vertical_padding / 2;
      width: auto;
      height: inherit;
      z-index: 0;
      overflow-x: hidden;
      overflow-y: hidden;
      @supports (backdrop-filter: blur(15px)) {
        &.widget--background-blurred {
          backdrop-filter: blur(8px);
          margin: 0;
          padding: $vertical_padding / 2;
          border-radius: 0.625rem;
        }
      }
    }
  }
}

.preview .grid-stack {
  margin: 0 auto;
  height: 1900px;
  width: 1070px;
  > .grid-stack-item {
    @for $i from 1 through $gridstack-rows-portrait {
      &[data-gs-height="#{$i}"] {
        height: (100% / $gridstack-rows-portrait) * $i;
      }
      &[data-gs-y="#{$i}"] {
        top: (100% / $gridstack-rows-portrait) * $i;
      }
    }
  }

  @media (orientation: landscape) {
    height: 1070px;
    width: 1900px;
    > .grid-stack-item {
      @for $i from 1 through $gridstack-rows-landscape {
        &[data-gs-height="#{$i}"] {
          height: (100% / $gridstack-rows-landscape) * $i;
        }
        &[data-gs-y="#{$i}"] {
          top: (100% / $gridstack-rows-landscape) * $i;
        }
      }
    }
  }
}
</style>
