<template>
  <section class="grid-stack-item-content widget">
    <h2 class="widget__title">{{ widget.attributes.title[language] }}</h2>
    <span v-if="widget.attributes.subtitle">{{ widget.attributes.subtitle }}</span>
    <component :is="widget.id" :currentSettings="widgetInstance.attributes.configuration" :records="records" :language="languageTag" :locale="language" :backendUrl="backendUrl" />
  </section>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import httpVueLoader from "http-vue-loader";
import appconfig from "@/appconfig";

export default {
  name: "WidgetInstanceWrapper",
  components: {},
  props: {
    widgetInstance: {
      type: Object,
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
    records: function() {
      // TODO: Can this be written more concise?
      const sourceInstances = this.widgetInstance.relationships.sourceInstances
        .data;
      const records = sourceInstances
        .map(si => {
          return this.sourceInstances[si.id].relationships.recordLinks.data;
        })
        .flat()
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

      return records;
    },
    languageTag: function() {
      const regex = new RegExp(/([A-Z]{1}[a-z]{1})/g);
      return this.language.replace(regex, match => {
        return match.toUpperCase().padStart(match.length + 1, "-");
      });
    },
    ...mapGetters(["language"]),
    ...mapState(["sourceInstances", "recordLinks"])
  },
  beforeMount: function() {
    this.$options.components[this.widget.id] = httpVueLoader(
      `${appconfig.backendUrl}/assets/${this.widget.id}/templates/display.vue`
    );
  }
};
</script>
