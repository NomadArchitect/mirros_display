<template>
  <section class="grid-stack-item-content widget">
    <h2 v-show="widgetInstance.attributes.showtitle" class="widget__title">
      {{ widgetInstance.attributes.title || localizedTitleOrFallback }}
    </h2>
    <component
      :is="widget.id"
      :currentSettings="widgetInstance.attributes.configuration"
      :currentPosition="widgetInstance.attributes.position"
      :sourcesConfigured="sourcesConfigured"
      :records="records"
      :language="languageTag"
      :locale="language"
      :backendUrl="backendUrl"
      :fetchAsset="fetchAsset"
    />
  </section>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import httpVueLoader from "http-vue-loader";
import axios from "axios";
import appconfig from "@/app-config";

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
      backendUrl: appconfig.backendUrl
    };
  },
  computed: {
    widget: function() {
      return this.$store.state.widgets[
        this.widgetInstance.relationships.widget.data.id
      ];
    },
    sourcesConfigured: function() {
      if (this.widgetInstance.relationships.group === null) return true;
      return this.widgetInstance.relationships.sourceInstances.data.length > 0
        ? true
        : false;
    },
    records: function() {
      // Return early if the widget has no group, and thus no records.
      if (this.widgetInstance.relationships.group === null) return [];

      // TODO: Can this be written more concise?
      const sourceInstances = this.widgetInstance.relationships.sourceInstances
        .data;
      const records = sourceInstances.map(si => {
        return this.sourceInstances[si.id].relationships.recordLinks.data;
      });
      // .flat() not supported by WPE fork yet
      return [].concat
        .apply([], records)
        .filter(link => {
          return (
            this.recordLinks[link.id].relationships.group.data.id ===
            this.widgetInstance.relationships.group.data.id
          );
        })
        .map(link => {
          const record = this.recordLinks[link.id].relationships.recordable
            .data;
          return this.$store.state[record.type][record.id];
        });
    },
    localizedTitleOrFallback: function() {
      return (
        this.widget.attributes.title[this.language] ||
        this.widget.attributes.title["enGb"]
      );
    },
    ...mapGetters(["language"]),
    ...mapState(["sourceInstances", "recordLinks"])
  },
  beforeMount: function() {
    this.$options.components[this.widget.id] = httpVueLoader(
      `${appconfig.backendUrl}/assets/${this.widget.id}/templates/display.vue?${
        this.widget.attributes.version
      }`
    );
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
