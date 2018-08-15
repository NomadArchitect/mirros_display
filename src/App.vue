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
          :is="moduleData.id"
          :key="moduleData.id"
          v-bind:data="moduleData.attributes.data"
        ></component>
      </div>
    </main>

  </div>
</template>

<script>
import Clock from "./components/Clock";
import DataTable from "./components/DataTable";
import List from "./components/List";
import GenericHTML from "./components/GenericHTML";

export default {
  name: "app",
  components: {
    DataTable,
    List,
    GenericHTML
  },
  data: () => ({
    data: [],
    errors: [],
    serverError: ""
  }),
  created() {}
};
</script>

<style>
body {
  margin: 0;
  background-color: black;
}

#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: white;
}
</style>
