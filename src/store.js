import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";
import normalize from "json-api-normalizer";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    systemStatus: {},
    networkError: false,
    settings: {},
    errors: [],
    connectionError: "",
    widgetInstances: {},
    sourceInstances: {},
    recordLinks: {},
    calendars: {},
    reminderLists: {},
    weatherOwms: {},
    newsfeeds: {},
    publicTransports: {}
  },
  mutations: {
    SET_NETWORK_ERROR: (state, error) => {
      state.networkError = error;
    },
    SET_SYSTEMSTATUS: (state, payload) => {
      state.systemStatus = payload;
    },
    SET_SETTINGS: (state, payload) => {
      state.settings = { ...state.settings, ...payload };
    },
    SET_ERRORS: (state, errors) => {
      state.errors = errors;
    },
    SET_WIDGETS: (state, payload) => {
      state.widgets = payload;
    },
    SET_WIDGETINSTANCES: (state, payload) => {
      state.widgetInstances = payload;
    },
    SET_SOURCEINSTANCES: (state, payload) => {
      state.sourceInstances = payload;
    },
    SET_RECORDLINKS: (state, payload) => {
      state.recordLinks = payload;
    },
    SET_CALENDARS: (state, payload) => {
      state.calendars = payload;
    },
    SET_REMINDERLISTS: (state, payload) => {
      state.reminderLists = payload;
    },
    SET_WEATHEROWMS: (state, payload) => {
      state.weatherOwms = payload;
    },
    SET_NEWSFEEDS: (state, payload) => {
      state.newsfeeds = payload;
    },
    SET_PUBLICTRANSPORTS: (state, payload) => {
      state.publicTransports = payload;
    }
  },
  actions: {
    fetchSystemStatus: async ({ commit, dispatch }) => {
      return new Promise(async (resolve, reject) => {
        try {
          const res = await axios.get("/system/status");
          commit("SET_SYSTEMSTATUS", res.data.meta);
          resolve();
        } catch (error) {
          dispatch("handleError", error);
          reject();
        }
      });
    },
    fetchFullData: async ({ dispatch }) => {
      return Promise.all([
        dispatch("fetchSetting", "system_language"),
        dispatch("fetchSetting", "personal_name"),
        dispatch("fetchSetting", "system_timezone"),
        dispatch("fetchWidgetInstances", {
          include: [
            "widget",
            "source-instances",
            "source-instances.record-links",
            "source-instances.record-links.recordable"
          ]
        })
      ]);
    },
    fetchWidgetInstances: async (
      { commit, dispatch },
      { include: includes }
    ) => {
      const includeString = buildIncludeString(includes);
      try {
        const response = await axios.get(`/widget-instances${includeString}`);
        const normalized = normalize(response.data, normalizerOptions);
        commitAll(commit, normalized);
      } catch (error) {
        dispatch("handleError", error);
      }
    },
    fetchSetting: async ({ commit, dispatch }, setting) => {
      try {
        const response = await axios.get(`/settings/${setting}`);
        const normalized = normalize(response.data, normalizerOptions);

        commit("SET_SETTINGS", normalized.settings);
      } catch (error) {
        dispatch("handleError", error);
      }
    },
    handleError: ({ commit }, error) => {
      if (error.response) {
        if (error.response.data.errors) {
          // Response contains errors from the backend
          commit("SET_ERRORS", error.response.data.errors);
        } else {
          // Response is likely a proxy error from nginx
          commit("SET_NETWORK_ERROR", true);
        }
      } else {
        commit("SET_NETWORK_ERROR", true);
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
    commit(`SET_${key.toUpperCase().replace("-", "_")}`, response[key]);
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
