<template>
  <section class="grid-stack-item-content widget">
    <h2
      v-show="widgetInstance.attributes.showtitle"
      class="widget__title"
      :id="`widget-title-${widgetInstance.id}`"
    >
      {{ widgetInstance.attributes.title || localizedTitleOrFallback }}
    </h2>
    <p v-if="renderError">
      {{
        t(
          "Aw snap! Something went wrong. Please remove this widget and send us a bug report."
        )
      }}
    </p>
    <p v-else-if="loadError">
      {{
        t(
          "An error occured while loading this widget. Please reload the display through Help > Reload Screen"
        )
      }}
    </p>
    <component
      v-else
      :is="widget.id"
      :currentSettings="widgetInstance.attributes.configuration"
      :currentDimensions="currentDimensions"
      :sourcesConfigured="sourcesConfigured"
      :records="records"
      :language="languageTag"
      :locale="language"
      :backendUrl="$root.$options.backendUrl"
      :fetchAsset="fetchAsset"
    />
  </section>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import httpVueLoader from "http-vue-loader";
import axios from "axios";

export default {
  name: "WidgetInstanceWrapper",
  components: {},
  props: {
    widgetInstance: {
      type: Object,
      required: true
    },
    languageTag: {
      type: String,
      required: true
    }
  },
  data: function() {
    return {
      loadError: false
    };
  },
  asyncComputed: {
    /**
     * Computes the actual pixel dimensions for the inner container, minus the title if currently shown, and adds the configured grid position.
     */
    currentDimensions: async function() {
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
        ...this.widgetInstance.attributes.position
      };
    }
  },
  computed: {
    widget: function() {
      return this.widgetForInstance(this.widgetInstance);
    },
    sourcesConfigured: function() {
      if (this.widgetInstance.relationships.group === null) return true;
      return this.widgetInstance.relationships.sourceInstances.data.length > 0
        ? true
        : false;
    },
    records: function() {
      if (
        this.widgetInstance.relationships.instanceAssociations.data.length > 0
      ) {
        return this.recordsForWidgetInstance(this.widgetInstance);
      } else {
        return [];
      }
    },
    localizedTitleOrFallback: function() {
      return (
        this.widget.attributes.title[this.language] ||
        this.widget.attributes.title["enGb"]
      );
    },
    renderError: function() {
      return this.runtimeError.includes(this._uid);
    },
    ...mapGetters([
      "language",
      "widgetForInstance",
      "recordsForWidgetInstance"
    ]),
    ...mapState(["sourceInstances", "runtimeError"])
  },
  beforeMount: function() {
    if (!this.widget) {
      this.loadError = true;
    } else {
      this.$options.components[this.widget.id] = httpVueLoader(
        `${this.$root.$options.backendUrl}/assets/${this.widget.id}/templates/display.vue?${this.widget.attributes.version}`
      );
    }
  },
  methods: {
    fetchAsset: async function(type, name) {
      return axios
        .get(`/assets/${this.widget.id}/${type}/${name}`)
        .then(res => res.data);
    }
  }
};
</script>
