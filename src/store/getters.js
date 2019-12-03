import { NmConnectivityState } from "@/constants";

export default {
  language: state => {
    return state.settings.system_language?.attributes?.value ?? "enGb";
  },
  widgetForInstance: state => instance => {
    return state.widgets[instance.relationships.widget.data.id];
  },
  /**
   * Returns all sub-resources that have been chosen from the associated source instance's records.
   */
  recordsForWidgetInstance: state => instance => {
    const associations = instance.relationships.instanceAssociations.data
      .map(ia => state.instanceAssociations[ia.id])
      .filter(assoc => assoc != undefined);

    const records = associations.reduce((acc, assoc) => {
      const sid = assoc.relationships.sourceInstance.data.id;
      const gid = assoc.relationships.group.data.id;
      assoc.attributes.configuration.chosen.forEach(choice => {
        acc.push(
          state.sourceInstances[sid]?.attributes?.records[gid]?.[choice]
        );
      });
      return acc;
    }, []);

    return records;
  },
  /** 
    FIXME: In some cases, the glancrsetup network active state is not available fast enough. As it wouldn't make sense to put mirr.OS behind a captive portal WiFi when there's no UI to accept T&C, we rely on connectivity state atm.
  */
  ap_active: state => {
    return state.systemStatus.connectivity === NmConnectivityState.PORTAL;
    /*
    let ret;
    state.systemStatus.networks.forEach(network => {
      if (network.connection_id === "glancrsetup") {
        ret = network.active;
      }
    });
    return ret;
    */
  },
  systemDisconnected: state => {
    return state.systemStatus.connectivity <= NmConnectivityState.PORTAL;
  }
};
