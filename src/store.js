import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";
import normalize from "json-api-normalizer";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    systemStatus: {},
    settings: {},
    errors: [],
    connectionError: "",
    widgetInstances: {},
    sourceInstances: {},
    recordLinks: {}
  },
  mutations: {
    SET_SYSTEMSTATUS: (state, payload) => {
      state.systemStatus = payload;
    },
    SET_SETTINGS: (state, payload) => {
      state.settings = { ...state.settings, ...payload };
    },
    ADD_ERROR: (state, error) => {
      state.errors = [...state.errors, error];
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
  actions: {
    fetchSystemStatus: async ({ commit }) => {
      try {
        const res = await axios.get("/system/status");
        commit("SET_SYSTEMSTATUS", res.data.meta);
      } catch (error) {
        commit("ADD_ERROR", error.data ? error.data.errors : error.response);
      }
    },
    fetchWidgetInstances: async ({ commit }, { include: includes }) => {
      const includeString = buildIncludeString(includes);
      try {
        const response = await axios.get(`/widget-instances${includeString}`);
        const normalized = normalize(response.data, normalizerOptions);
        commitAll(commit, normalized);
      } catch (error) {
        commit("ADD_ERROR", error.data ? error.data.errors : error.response);
      }
    },
    fetchSetting: async ({ commit }, setting) => {
      try {
        const response = await axios.get(`/settings/${setting}`);
        const normalized = normalize(response.data, normalizerOptions);

        commit("SET_SETTINGS", normalized.settings);
      } catch (error) {
        commit("ADD_ERROR", error.data ? error.data.errors : error.response);
      }
    }
  },
  getters: {
    language: state => {
      return state.settings.system_language != undefined
        ? state.settings.system_language.attributes.value
        : "enGb";
    }
  }
});

function commitAll(commit, response) {
  Object.keys(response).forEach(key => {
    commit(`ADD_${key.toUpperCase().replace("-", "_")}`, response[key]);
  });
}

/* HELPERS – UNTIL API PACKAGE IS READY, SEE https://gitlab.com/glancr/mirros_one/issues/2 */
function buildIncludeString(includes) {
  if (includes.length === 0) {
    return "";
  }

  return includes.reduce((acc, include, currentIndex, array) => {
    let sep = currentIndex != 0 && currentIndex != array.length ? "," : "";
    return `${acc}${sep}${include}`;
  }, "?include=");
}

/* function buildFilterString(filters) {
  if (filters.length === 0) {
    return "";
  }

  return filters.reduce((acc, filter, currentIndex, array) => {
    let sep = currentIndex != 0 && currentIndex != array.length ? "&" : "";
    return `${acc}${sep}filter[${filter[0]}]=${filter[1]}`;
  }, "?");
} */

const normalizerOptions = { camelizeKeys: true };
