<template>
    <div id="clock">
      <div>
        <time>{{hour}}<sup>{{seconds}}</sup></time>
      </div>
      <span>{{date}}</span>
    </div>
</template>

<script>
  // Inspired by https://jsfiddle.net/Linusborg/meovg84x/
  import moment from 'moment'

  export default {
    name: 'clock',
    props: {
      format: Number,
      locale: String
    },
    data: () => {
      moment.locale(this.locale)

      let timeFormat
      switch (this.format) {
        case 12:
          timeFormat = 'hh:mm'
          break
        case 24:
          timeFormat = 'HH:mm'
          break
        default:
          timeFormat = 'HH:mm'
      }
      // @TODO: Format date according to locale.

      return {
        hour: moment().format(timeFormat),
        hourFormat: timeFormat,
        seconds: moment().format('ss'),
        date: moment().format('dd, DD.MM.YYYY')
      }
    },
    methods: {
      time () {
        this.hour = moment().format(this.hourFormat)
        this.seconds = moment().format('ss')
        this.date = moment().format('dd, DD.MM.YYYY')
      }
    },
    mounted () {
      this.interval = setInterval(this.time, 1000)
    },
    beforeDestroy () {
      clearInterval(this.interval)
    }
  }
</script>

<style scoped>
    #clock {

    }
</style>
