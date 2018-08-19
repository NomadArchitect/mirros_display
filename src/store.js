import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";
import normalize from "json-api-normalizer";

Vue.use(Vuex);

export default new Vuex.Store({
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
  actions: {
    fetchWidgetInstances: async ({ commit }, { include: includes }) => {
      const includeString = buildIncludeString(includes);
      try {
        const response = await axios.get(`/widget-instances${includeString}`);
        const normalized = normalize(response.data, normalizerOptions);
        commitAll(commit, normalized);
      } catch (error) {
        commit("ADD_ERROR", error);
      }
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

function buildFilterString(filters) {
  if (filters.length === 0) {
    return "";
  }

  return filters.reduce((acc, filter, currentIndex, array) => {
    let sep = currentIndex != 0 && currentIndex != array.length ? "&" : "";
    return `${acc}${sep}filter[${filter[0]}]=${filter[1]}`;
  }, "?");
}

const normalizerOptions = { camelizeKeys: true };
const defaultParams = {
  headers: {
    "Content-Type": "application/vnd.api+json"
  }
};
