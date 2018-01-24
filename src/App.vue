<template>
  <div id="app">
    <span v-if="serverError.length != 0">{{serverError}}</span>

    <main v-if="errors.length != 0">
      <span v-for="error in errors">Error {{ error.status }}: {{error.title}} (Source: {{error.source}})</span>
    </main>

    <main v-else-if="data.length === 0">
      <p>Loading</p>
    </main>

    <main>
      <div v-for="moduleData in data">
        <h2 :title="moduleData.attributes.title">{{ moduleData.attributes.title }}</h2>
        <span v-if="moduleData.attributes.subtitle" :subtitle="moduleData.attributes.subtitle"></span>

        <div v-if="moduleData.type === 'dwtfyw'" :id="moduleData.attributes.totallyCustomType"></div>
        <component
          v-else-if="moduleData.type === 'custom-inline'"
          :is="moduleData.attributes.customType"
          :key="moduleData.id"
          v-bind:data="moduleData.attributes.data"
        ></component>
        <component
          v-else
          :is="moduleData.type"
          :key="moduleData.id"
          v-bind:data="moduleData.attributes.data"
        ></component>
      </div>
    </main>

  </div>
</template>

<script>
  import Vue from 'vue'
  import Hello from './components/Hello'
  import Clock from './components/Clock'
  import DataTable from './components/DataTable'
  import List from './components/List'
  import GenericHTML from './components/GenericHTML'

  export default {
    name: 'app',
    components: {
      Hello,
      DataTable,
      List,
      GenericHTML
    },
    data: () => ({
      data: [],
      errors: [],
      meta: {},
      serverError: '',
      creators: []
    }),
    created () {
      // @TODO: Use final API URL and get rid of debug logging
      // Get the data object from the backend API. Uses vue-axios.
      this.$http.get('static/data.json')
        .then(response => {
          if (response.status !== 200) {
            this.serverError = 'Cannot reach backend server: ' + response.statusText
          } else {
            // @TODO: Use ES6 destructuring magic to keep DRY
            const responseData = response.data
            // Scan module definitions if they contain a custom component that needs initialization.
            responseData.data.forEach(module => {
              const attr = module.attributes
              if (module.type === 'dwtfyw') {
                // Define the component.
                // Register the component globally.
              }
              if (module.type === 'custom-inline') {
                let components = {}
                attr.uses.forEach(use => {
                  if (use === 'Clock') {
                    components = {Clock}
                  }
                })
                // Get the custom template defined in the module object.

                // Define the component.
                const options = {
                  template: attr.template,
                  components: components,
                  props: {
                    title: String,
                    subtitle: String,
                    data: Object
                  }
                }
                // Register the component globally.
                Vue.component(attr.customType, Vue.extend(options))
              }
            })
            console.log('last refresh:', responseData.meta.timestamp)
            // Assign return object values to member variables. Yay, ES6!
            Object.assign(this, responseData)
          }
        })
        // After registering all custom components, add the data to the App to render it
        .catch(error => {
          this.serverError = 'Fatal error: ' + error
        })
    }
  }
</script>

<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: white;
  }
</style>
