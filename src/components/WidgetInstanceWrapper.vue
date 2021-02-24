<template>
  <section class="grid-stack-item-content widget">
    <h2
      v-show="attributes.showtitle"
      class="widget__title"
      :id="`widget-title-${widgetInstance.id}`"
    >
      {{ attributes.title || localizedTitleOrFallback }}
    </h2>
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
      :records="records"
      :language="language | languageTag"
      :locale="language"
      :backendUrl="$root.$options.backendUrl"
      :fetchAsset="fetchAsset"
    />
    <p v-else>
      {{ t("Please select at least one account in the widget settings") }}
    </p>
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
    };
  },
  asyncComputed: {
    /**
     * Computes the actual pixel dimensions for the inner container, minus the title if currently shown, and adds the configured grid position.
     */
    currentDimensions: async function () {
      await this.$nextTick();
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
      // FIXME: Adapt calculation for landscape
      return {
        heightPx:
          Math.floor(
            (window.innerHeight / 21.33333) *
              this.widgetInstance.attributes.position.height
          ) -
          titleHeight -
          20,
        widthPx:
          (window.innerWidth / 12) *
            this.widgetInstance.attributes.position.width -
          20,
        ...this.widgetInstance.attributes.position,
      };
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
    ...mapGetters([
      "language",
      "widgetForInstance",
      "recordsForWidgetInstance",
      "showErrorNotifications",
    ]),
    ...mapState(["sourceInstances", "runtimeError"]),
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
  },
};
</script>
