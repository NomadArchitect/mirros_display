import Vue from "vue";
import Vuex from "vuex";

import actions from "@/store/actions";
import getters from "@/store/getters";

Vue.use(Vuex);

const types = [
  "boards",
  "groups",
  "instanceAssociations",
  "settings",
  "sourceInstances",
  "sources",
  "widgetInstances",
  "widgets"
];

export default new Vuex.Store({
  actions,
  getters,
  state: Object.assign({}, ...initStateForResourceTypes(types), {
    systemStatus: {},
    networkError: false,
    runtimeError: [],
    settings: {},
    errors: [],
    connectionError: ""
  }),
  mutations: Object.assign({}, ...generateMutationsForResourceTypes(types), {
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

/**
 *
 * @param {string[]} typeList - list of normalized JSON:API resource names (e.g. dash transformed to camelCase).
 */
function initStateForResourceTypes(typeList) {
  return typeList.map(type => {
    let state = {};
    state[type] = {};
    return state;
  });
}

/**
 * Generate ADD_OR_UPDATE and DELETE mutations for all passed resource types.
 * @param {string[]} typeList - list of normalized JSON:API resource names (e.g. dash transformed to camelCase).
 */
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
