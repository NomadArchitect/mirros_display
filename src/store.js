import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  mutations: {},
  actions: {}
  state: {
    language: "enGb",
    errors: [],
    widgetInstances: {},
    sourceInstances: {},
    recordLinks: {}
  },
});
