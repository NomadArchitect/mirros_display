import { NmState, NmConnectivityState } from "@/enums";

export default {
  activeBoardId: (state) => {
    return state.settings?.system_activeboard?.attributes?.value;
  },

  backgroundImage: (state, getters) => {
    return state.boards[getters.activeBoardId]?.attributes.backgroundUrl;
  },

  language: (state) => {
    return state.settings.system_language?.attributes?.value ?? "enGb";
  },

  showErrorNotifications: (state) => {
    return (
      state.settings.system_showerrornotifications?.attributes?.value ===
        "on" ?? true
    );
  },

  languageTag: (state, getters) => {
    const regex = new RegExp(/([A-Z]{1}[a-z]{1})/g);
    return getters.language.replace(regex, (match) => {
      return match.toUpperCase().padStart(match.length + 1, "-");
    });
  },

  widgetForInstance: (state) => (instance) => {
    return state.widgets[instance.relationships.widget.data.id];
  },

  /**
   * Returns all sub-resources that have been chosen from the associated source instance's records.
   */
  recordsForWidgetInstance: (state) => (instance) => {
    const associations = instance.relationships.instanceAssociations.data
      .map((ia) => state.instanceAssociations[ia.id])
      .filter((assoc) => assoc != undefined);

    const records = associations.reduce((acc, assoc) => {
      const sid = assoc.relationships.sourceInstance.data.id;
      const gid = assoc.relationships.group.data.id;
      assoc.attributes.configuration.chosen.forEach((choice) => {
        acc.push(
          state.sourceInstances[sid]?.attributes?.records[gid]?.[choice]
        );
      });
      return acc;
    }, []);

    return records;
  },

  /**
    FIXME: We can't rely on NetworkManager's connectivity check on Ubuntu Core yet. 1.2.2 has it disabled entirely, and 1.10 doesn't reliably report our own captive portal, but sometimes outputs LIMITED (^= 4).
  */
  ap_active: (state) => {
    if (state.systemStatus.primary_connection != null) {
      return (
        state.systemStatus.primary_connection.connection_id === "glancrsetup"
      );
    } else {
      return false;
    }
  },
  systemDisconnected: (state, getters) => {
    if (state.systemStatus.connectivity_check_available) {
      return state.systemStatus.connectivity <= NmConnectivityState.PORTAL;
    } else {
      return (
        state.online === false &&
        state.primaryConnection != null &&
        getters.ap_active === false
      );
    }
  },
  primaryConnectionIP: (state) => {
    const primary = state.systemStatus.primary_connection;
    // TODO: Use optional chaining once active with Babel
    return primary && primary.ip4_address;
  },
  connecting: (state) => {
    return state.systemStatus.nm_state === NmState.CONNECTING;
  },

  /**
   * Gets the options for a given setting.
   * @param {string} setting Machine name for the setting, e.g. system_language
   * @returns {Object|Array|undefined} The options object/array, or undefined if the setting is not present.
   */
  settingOptions: (state) => (setting) => {
    return state.settings[setting]?.attributes?.options;
  },
};
