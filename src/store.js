import Vue from "vue";
import Vuex from "vuex";

import actions from "@/store/actions";
import getters from "@/store/getters";

Vue.use(Vuex);

export default new Vuex.Store({
  actions,
  getters,
  state: {
    systemStatus: {},
    networkError: false,
    runtimeError: [],
    settings: {},
    errors: [],
    connectionError: "",
    widgets: {},
    sources: {},
    widgetInstances: {},
    sourceInstances: {},
    instanceAssociations: {}
  },
  mutations: Object.assign({}, ...generateMutationsForCoreResources(), {
    SET_NETWORK_ERROR: (state, error) => {
      state.networkError = error;
    },
    SET_RUNTIME_ERROR: (state, error) => {
      state.runtimeError = [...state.runtimeError, error];
    },
    SET_SYSTEMSTATUS: (state, payload) => {
      state.systemStatus = payload;
    },
    SET_ERRORS: (state, errors) => {
      state.errors = errors;
    },
    SET_SETTING: (state, payload) => {
      state.settings = { ...state.settings, ...payload };
    }
  })
});

/* function buildFilterString(filters) {
  if (filters.length === 0) {
    return "";
  }

  return filters.reduce((acc, filter, currentIndex, array) => {
    let sep = currentIndex != 0 && currentIndex != array.length ? "&" : "";
    return `${acc}${sep}filter[${filter[0]}]=${filter[1]}`;
  }, "?");
} */

function generateMutationsForCoreResources() {
  const groups = [
    "widgets",
    "sources",
    "groups",
    "widgetInstances",
    "sourceInstances",
    "instanceAssociations",
    "settings"
  ];
  return generateMutationsForResourceTypes(groups);
}

function generateMutationsForResourceTypes(typeList) {
  return typeList.map(type => {
    const caps = type.toUpperCase();
    let mutations = {};
    mutations[`ADD_OR_UPDATE_${caps}`] = (state, payload) => {
      state[type] = { ...state[type], ...payload };
    };
    mutations[`DELETE_${caps}`] = (state, payload) => {
      Vue.delete(state[type], payload);
    };
    return mutations;
  });
}
