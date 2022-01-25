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
  ap_active: (state) => {
    return (
      state.systemStatus?.network?.primary_connection?.id === "glancrsetup" ??
      false
    );
  },
  systemDisconnected: (state) => {
    return (
      state.systemStatus.network?.connectivity <= NmConnectivityState.PORTAL
    );
  },
  primaryConnectionIP: (state) => {
    return state.systemStatus.network?.primary_connection?.ip4_address;
  },
  connecting: (state) => {
    return state.systemStatus.network?.state === NmState.CONNECTING;
  },

  /**
   * Check if the backend is currently running first-time setup tasks.
   * @param {Object} state 
   * @returns {Boolean} True if the backend is running first-time setup tasks, false otherwise.
   */
  runningSetupTasks: (state) => {
    return state.systemStatus?.running_setup_tasks ?? false;
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
