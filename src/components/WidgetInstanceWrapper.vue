<template>
  <section
    class="widget"
    :id="`widget-${widgetInstance.id}`"
    ref="widget"
    :class="{
      'widget--background-blurred': attributes.styles.backgroundBlur,
      'widget--larger-padding':
        attributes.position.width >= 4 && attributes.styles.backgroundBlur,
    }"
    :style="{
      ...gridPosition,
      ...widgetStyles,
    }"
  >
    <h2
      v-show="attributes.showtitle"
      class="widget__title"
      :style="{ textAlign: attributes.styles.horizontalAlign }"
      :id="`widget-title-${widgetInstance.id}`"
    >
      {{ attributes.title || localizedTitleOrFallback }}
    </h2>
    <section :class="['widget__content', ...positioningClasses]">
      <template v-if="renderError">
        <p v-show="showErrorNotifications">
          {{
            t(
              "Aw snap! Something went wrong. Please remove this widget and send us a bug report."
            )
          }}
        </p>
      </template>
      <template v-else-if="loadError">
        <p v-show="showErrorNotifications">
          {{
            t(
              "An error occured while loading this widget. Please reload the display through Help > Reload Screen"
            )
          }}
        </p>
      </template>
      <!-- FIXME: Remove sourcesConfigured prop in https://gitlab.com/glancr/mirros_display/-/issues/27 -->
      <component
        v-else-if="sourcesConfiguredOrNotRequired"
        :is="widget.id"
        :sourcesConfigured="sourcesConfiguredOrNotRequired"
        :currentSettings="attributes.configuration || undefined"
        :currentDimensions="currentDimensions"
        :currentStyles="attributes.styles"
        :records="records"
        :language="language | languageTag"
        :locale="language"
        :backendUrl="$root.$options.backendUrl"
        :fetchAsset="fetchAsset"
      />
      <p v-else class="widget__no-source-configured">
        {{ t("Please select at least one account in the widget settings") }}
      </p>
    </section>
  </section>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import httpVueLoader from "http-vue-loader";
import axios from "axios";
import { languageTag } from "@/mixins/formatters";

export default {
  name: "WidgetInstanceWrapper",
  props: {
    widgetInstance: {
      type: Object,
      required: true,
    },
    languageTag: {
      type: String,
      required: true,
    },
  },
  filters: {
    languageTag: languageTag,
  },
  data: function () {
    return {
      loadError: false,
      currentDimensions: null,
    };
  },
  watch: {
    "widgetInstance.attributes": {
      immediate: true,
      handler: "updateDimensions",
    },
  },
  computed: {
    widget: function () {
      return this.widgetForInstance(this.widgetInstance);
    },
    sourcesConfiguredOrNotRequired: function () {
      if (this.widgetInstance.relationships.group.data === null) return true;

      return this.widgetInstance.relationships.sourceInstances.data.length > 0
        ? true
        : false;
    },
    records: function () {
      if (
        this.widgetInstance.relationships.instanceAssociations.data.length > 0
      ) {
        return this.recordsForWidgetInstance(this.widgetInstance);
      } else {
        return [];
      }
    },
    localizedTitleOrFallback: function () {
      return (
        this.widget.attributes.title[this.language] ||
        this.widget.attributes.title["enGb"]
      );
    },
    renderError: function () {
      return this.runtimeError.includes(this._uid);
    },
    attributes() {
      return this.widgetInstance.attributes;
    },
    widgetStyles() {
      const styles = this.attributes.styles;
      const color =
        styles.fontColor !== this.settings?.system_fontcolor?.attributes?.value
          ? styles.fontColor
          : "inherit";
      return {
        color: color,
        fill: color,
        fontSize: `${styles.fontSize ?? "100"}%`,
      };
    },
    positioningClasses() {
      return [
        `horizontal-align--${this.attributes.styles.horizontalAlign}`,
        `vertical-align--${this.attributes.styles.verticalAlign}`,
      ];
    },
    /**
     * Translates zero-indexed gridstack positioning into CSS grid declarations (starting at 1).
     * @param {object} gsPosition
     * @param {number} gsPosition.x horizontal position of the upper left corner
     * @param {number} gsPosition.y vertical position of the upper left corner
     * @param {number} gsPosition.width widget width in columns
     * @param {number} gsPosition.height widget height in rows
     * @returns {object} The grid-area placement for this widget
     */
    gridPosition() {
      const gsPosition = this.attributes.position;
      return {
        "grid-column-start": gsPosition.x + 1,
        "grid-row-start": gsPosition.y + 1,
        "grid-column-end": `span ${gsPosition.width}`,
        "grid-row-end": `span ${gsPosition.height}`,
      };
    },
    ...mapGetters([
      "language",
      "widgetForInstance",
      "recordsForWidgetInstance",
      "showErrorNotifications",
    ]),
    ...mapState(["sourceInstances", "runtimeError", "settings"]),
  },
  beforeMount: function () {
    if (!this.widget) {
      this.loadError = true;
    } else {
      this.$options.components[this.widget.id] = httpVueLoader(
        `${this.$root.$options.backendUrl}/assets/${this.widget.type}/${this.widget.id}/templates/display.vue?${this.widget.attributes.version}`
      );
    }
  },
  methods: {
    fetchAsset: async function (type, name) {
      return axios
        .get(`/assets/${this.widget.type}/${this.widget.id}/${type}/${name}`)
        .then((res) => res.data);
    },
    updateDimensions() {
      this.$nextTick(function () {
        let titleHeight = 0;
        if (this.widgetInstance.attributes.showtitle) {
          const el = document.getElementById(
            `widget-title-${this.widgetInstance.id}`
          );
          if (el != null && el.clientHeight > 0) {
            titleHeight =
              el.clientHeight +
              parseInt(
                window.getComputedStyle(el).getPropertyValue("margin-bottom")
              );
          }
        }

        this.currentDimensions = {
          heightPx: this.$refs.widget.clientHeight - titleHeight - 20,
          widthPx: this.$refs.widget.clientWidth - 20,
          ...this.widgetInstance.attributes.position,
        };
      });
    },
  },
};
</script>
<style>
.widget {
  overflow: hidden;
  display: grid;
  grid-template-areas: "title" "content";
  grid-auto-rows: min-content minmax(min-content, 100%);
}

@supports (backdrop-filter: blur(10px)) {
  .widget--background-blurred {
    backdrop-filter: blur(10px);
    border-radius: 0.625rem;
    background: radial-gradient(
      rgba(255, 255, 255, 0.3),
      rgba(255, 255, 255, 0.15)
    );
  }
  .widget--background-blurred .widget__title {
    background-color: rgba(255, 255, 255, 0.5);
  }
}

.widget__title {
  margin: 0;
  font-size: max(2rem, 50%);
  line-height: 1;
  padding: 0.625rem;
  align-self: top;
  grid-area: title;
}

.widget__content {
  padding: 0.625rem;
  display: flex;
  grid-area: content;
}

.widget--larger-padding .widget__title,
.widget--larger-padding .widget__content {
  padding: 1.25rem;
}

.horizontal-align--left {
  justify-content: start;
  text-align: left;
}

.horizontal-align--right {
  justify-content: end;
  text-align: right;
}

.horizontal-align--center {
  justify-content: center;
  text-align: center;
}
.horizontal-align--justify {
  justify-content: space-evenly;
  text-align: justify;
}

.vertical-align--top {
  align-items: start;
}

.vertical-align--center {
  align-items: center;
}

.vertical-align--bottom {
  align-items: end;
}

.vertical-align--stretch {
  align-items: stretch;
}

.widget__no-source-configured {
  text-align: center;
  width: 100%;
  font-size: 1.25rem;
  margin: 0;
}
</style>
