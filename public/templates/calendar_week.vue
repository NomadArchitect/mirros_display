<template>
    <div v-if="!records.length">{{ t('Nothing on your schedule') }}</div>
    <table v-else>
      <thead>
        <tr>
          <th></th>
          <th v-for="day in days" :key="day">{{day}}</th>
        </tr>
      </thead>
      <tr v-for="calendar in calendars" :key="calendar.id">
        <th scope="row">{{calendar.attributes.name}}</th>
        <td v-for="(events, day) in calendar.attributes.events" :key="day">
          <span v-for="event in events" :key="event.id" class="event__title">
            <img v-if="event.allDay" src="http://localhost:3000/assets/ical/images/24-hours.svg" alt="24-hour icon" />
            <em v-else>{{ formatDate(event.dtstart) }}: </em>
            {{ event.summary }}
            </span>
        </td>
      </tr>
    </table>
</template>

<script>
module.exports = {
  name: "CalendarWeek",
  props: {
    configuration: {
      required: false
    },
    records: {
      type: Array,
      required: true
    },
    language: {
      type: String,
      required: true
    }
  },
  locales: {
    deDe: {
      "Nothing on your schedule": "Keine weiteren Termine"
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
    calendars: function() {
      // Without deep copying, we would modify the records props
      let clone = JSON.parse(JSON.stringify(this.records));

      return clone.map(record => {
        record.attributes.events = record.attributes.events
          .filter(this.filterFn)
          .reduce(
            (acc, event) => {
              console.log(acc);
              const eventDate = new Date(event.dtstart)
                .toISOString()
                .slice(0, 10);

              acc[eventDate].push(event);
              return acc;
            },
            { ...(this.days.forEach = []) }
          );
        return record;
      });
    },
    days: function() {
      const now = new Date();
      let nextWeek = [];
      for (let i = 0; i < 5; i++) {
        nextWeek.push(
          this.formatHeaderDate(new Date().setDate(now.getDate() + i))
        );
      }
      return nextWeek;
    }
  },
  methods: {
    filterFn: function(event) {
      const eventDate = new Date(event.dtstart);
      const now = new Date();
      const inSixDays = new Date().setDate(new Date().getDate() + 6);
      return eventDate >= now && eventDate < inSixDays;
    },
    formatDate: function(date) {
      const options = {
        ...this.options,
        hour12: this.configuration.timeformatChoice === "12"
      };
      return new Intl.DateTimeFormat(this.language, options).format(
        Date.parse(date)
      );
    },
    formatHeaderDate: function(date) {
      const options = {
        weekday: "short"
      };
      return new Intl.DateTimeFormat(this.language, options).format(date);
    }
  }
};
</script>

<style scoped>
table {
  width: 100%;
}
tr {
  border-bottom: 1px solid grey;
}

td {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  /* padding: 0 10px 5px 0; */
  vertical-align: baseline;
  vertical-align: middle;
  border-bottom: 1px solid #666;
}

img {
  height: 1rem;
  vertical-align: sub;
}

.event__title::after {
  content: ", ";
}

.event__title:last-of-type::after {
  content: "";
}
</style>
