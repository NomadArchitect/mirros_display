import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  actions: {}
  state: {
    language: "enGb",
    errors: [],
    widgetInstances: {},
    sourceInstances: {},
    recordLinks: {}
  },
  mutations: {
    ADD_ERROR: (state, error) => {
      state.errors = state.errors.push(error);
    },
    ADD_WIDGETS: (state, payload) => {
      state.widgets = { ...state.widgets, ...payload };
    },
    ADD_WIDGETINSTANCES: (state, payload) => {
      state.widgetInstances = { ...state.widgetInstances, ...payload };
    },
    ADD_SOURCEINSTANCES: (state, payload) => {
      state.sourceInstances = { ...state.sourceInstances, ...payload };
    },
    ADD_RECORDLINKS: (state, payload) => {
      state.recordLinks = { ...state.recordLinks, ...payload };
    },
    ADD_CALENDARS: (state, payload) => {
      state.calendars = { ...state.calendars, ...payload };
    },
    ADD_REMINDERLISTS: (state, payload) => {
      state.reminderLists = { ...state.reminderLists, ...payload };
    }
  },
});
