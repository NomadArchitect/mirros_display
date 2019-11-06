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
  }
};
