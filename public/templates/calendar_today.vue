<template>
    <table>
        <tr v-for="event in events" :key="event.id">
            <td v-if="event.allDay">ganztägig</td>
            <td v-else>{{ formatDate(event.dtstart) }}</td>
            <td>{{ event.summary }}</td>
        </tr>
    </table>
</template>

<script>
module.exports = {
  name: "CalendarToday",
  props: {
    configuration: {
      required: false
    },
    records: {
      type: Array,
      required: true
    }
  },
  data: function() {
    return {
      options: {
        hour: "2-digit",
        minute: "2-digit"
      }
    };
  },
  computed: {
    events: function() {
      return this.records.reduce((acc, record) => {
        const normalized = record.attributes.events
          .filter(event => {
            const eventDate = new Date(event.dtstart);
            const now = new Date();
            if (this.configuration.showPastEvents) {
              return eventDate.getDate() === now.getDate();
            } else {
              return (
                eventDate >= now && eventDate.getDate() < now.getDate() + 1
              );
            }
          })
          .map(event => {
            event.calendar = record.attributes.name;
            return event;
          });
        return acc.concat(normalized);
      }, []);
    }
  },
  methods: {
    formatDate: function(date) {
      const options = {
        ...this.options,
        hour12: this.configuration.timeformatChoice === "12"
      };
      return new Intl.DateTimeFormat("de-DE", options).format(Date.parse(date));
    }
  }
};
</script>

<style scoped>
td:first-of-type {
  text-align: right;
}
</style>
