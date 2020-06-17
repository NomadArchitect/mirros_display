import axios from "axios";
import normalize from "json-api-normalizer";

export default {
  cleanOrphanedRecordLinks: ({ state, commit }) => {
    let active = [];
    for (let si of Object.values(state.sourceInstances)) {
      si.relationships.recordLinks.data.forEach(link => active.push(link.id));
    }

    for (let [key, link] of Object.entries(state.recordLinks)) {
      if (active.includes(key)) return;

      const recordable = link.relationships.recordable.data;
      commit(`DELETE_${recordable.toUpperCase()}`, recordable.id);
      commit("DELETE_RECORDLINKS", link.id);
    }
  },
  fetchSystemStatus: async ({ commit, dispatch }) => {
    try {
      const res = await axios.get("/system/status");
      commit("SET_SYSTEMSTATUS", res.data.meta);
    } catch (error) {
      dispatch("handleError", error);
    }
  },
  fetchFullData: async ({ dispatch }) => {
    const settings = [
      "system_language",
      "personal_name",
      "system_timezone",
      "system_backgroundcolor",
      "system_fontcolor",
      "system_backgroundimage",
      "system_multipleboards",
      "system_activeboard"
    ];

    return Promise.all([
      ...settings.map(setting => dispatch("fetchSetting", setting)),
      dispatch("fetchActiveBoard")
    ]);
  },
  fetchSettings: async ({ dispatch }) => {
    const settings = [
      "system_language",
      "personal_name",
      "system_timezone",
      "system_backgroundcolor",
      "system_fontcolor",
      "system_backgroundimage",
      "system_multipleboards",
      "system_activeboard",
      "system_showerrornotifications"
    ];
    return Promise.all([
      ...settings.map(setting => dispatch("fetchSetting", setting))
    ]);
  },
  fetchActiveBoard: async ({ commit, getters, dispatch }) => {
    try {
      const includeString = buildIncludeString([
        "widgetInstances.widget",
        "widgetInstances.sourceInstances",
        "widgetInstances.instanceAssociations",
        "widgetInstances.sourceInstances.source"
      ]);
      const boardId = getters.activeBoardId;
      const response = await axios.get(`/boards/${boardId}${includeString}`);
      const normalized = normalize(response.data, normalizerOptions);
      commitAll(commit, normalized);
    } catch (error) {
      dispatch("handleError", error);
    }
  },
  fetchWidgetInstances: async ({ commit, dispatch }, { include: includes }) => {
    const includeString = buildIncludeString(includes);
    try {
      const response = await axios.get(`/widget-instances${includeString}`);
      const normalized = normalize(response.data, normalizerOptions);
      commitAll(commit, normalized);
    } catch (error) {
      dispatch("handleError", error);
    }
  },
  /**
   * @param {string} setting - slug of the setting to fetch, e.g. network_connectiontype for namespace `network` and setting connectionType.
   */
  fetchSetting: async ({ commit, dispatch }, setting) => {
    try {
      const response = await axios.get(`/settings/${setting}`);
      const normalized = normalize(response.data, normalizerOptions);

      commit("SET_SETTING", normalized.settings);
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
  },
  handleResourceUpdate: ({ commit }, resource) => {
    const normalized = normalize(resource, normalizerOptions);
    commitAll(commit, normalized);
  },
  handleResourceDeletion: ({ commit }, resource) => {
    const normalized = normalize(resource, normalizerOptions);
    let toCommit = { updated: {}, deleted: {} };
    switch (resource.data.type) {
      case "widgetInstances": {
        // This leaves unused widgets in the store
        const { sourceInstances, widgets, ...other } = normalized;
        toCommit.updated = {
          sourceInstances: sourceInstances,
          widgets: widgets
        };
        toCommit.deleted = other;
        break;
      }
      case "sourceInstances": {
        const { widgetInstances, sources, ...other } = normalized;
        toCommit.updated = {
          widgetInstances: widgetInstances,
          sources: sources
        };
        toCommit.deleted = other;
        break;
      }
      case "instanceAssociations": {
        // This leaves unused source instances with their records in the store, but ¯\_(ツ)_/¯
        const { widgetInstances, sourceInstances, ...other } = normalized;
        toCommit.updated = {
          widgetInstances: widgetInstances,
          sourceInstances: sourceInstances
        };
        toCommit.deleted = other;
        break;
      }
      default: {
        const { widgetInstances, sourceInstances, ...other } = normalized;
        toCommit.updated = {
          widgetInstances: widgetInstances,
          sourceInstances: sourceInstances
        };
        toCommit.deleted = other;
        break;
      }
    }
    commitAll(commit, toCommit.updated);
    deleteAll(commit, toCommit.deleted);
  }
};

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

function commitAll(commit, response) {
  for (let [type, resources] of Object.entries(response)) {
    const upper = type.toUpperCase();
    //for (let payload of Object.values(resources)) {
    commit(`ADD_OR_UPDATE_${upper}`, resources);
    //}
  }
}

function deleteAll(commit, response) {
  for (let [type, resources] of Object.entries(response)) {
    for (let id of Object.keys(resources)) {
      commit(`DELETE_${type.toUpperCase()}`, id);
    }
  }
}

const normalizerOptions = { camelizeKeys: false };
