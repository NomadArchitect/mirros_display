<template>
  <section class="grid-stack-item-content widget">
    <h2 class="widget__title">{{ widget.attributes.title[language] }}</h2>
    <span v-if="widget.attributes.subtitle">{{ widget.attributes.subtitle }}</span>
    <component :is="this.widget.id" :configuration="widgetInstance.attributes.configuration" :records="records" />
  </section>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import httpVueLoader from "http-vue-loader";

export default {
  name: "WidgetInstanceWrapper",
  components: {},
  props: {
    widgetInstance: {
      type: Object,
      required: true
    }
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
      const links = sourceInstances
        .map(si => {
          return this.sourceInstances[si.id].relationships.recordLinks.data;
        })
        .flat();
      const records = links.map(link => {
        const record = this.recordLinks[link.id].relationships.recordable.data;
        return this.$store.state[record.type][record.id];
      });

      return records;
    },
    ...mapGetters(["language"]),
    ...mapState(["sourceInstances", "recordLinks"])
  },
  beforeMount: function() {
    // if (this.widget.id != "calendar_today") return;
    this.$options.components[this.widget.id] = httpVueLoader(
      `./templates/${this.widget.id}.vue`
    );
    //TODO: Use backend route for templates `http://localhost:3000/templates/${this.widget.id}/display`
  }
};
</script>
