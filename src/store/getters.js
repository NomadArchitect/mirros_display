export default {
  language: state => {
    return state.settings.system_language != undefined
      ? state.settings.system_language.attributes.value
      : "enGb";
  },
  // TODO
  selectOrphanedRecords: () => res => {
    res;
  },
  widgetForInstance: state => instance => {
    return state.widgets[instance.relationships.widget.data.id];
  },
  recordsForWidgetInstance: state => instance => {
    // Return early if the widget has no group, and thus no records.
    if (instance.relationships.group === null) return [];

    // TODO: Can this be written more concise?
    const sourceInstances = instance.relationships.sourceInstances.data;
    const chosenSubresources = instance.relationships.instanceAssociations.data.map(
      ia => state.instanceAssociations[ia.id].attributes.configuration.chosen
    );

    const records = sourceInstances.map(si => {
      return state.sourceInstances[si.id].relationships.recordLinks.data;
    });
    // .flat() not supported by WPE fork yet
    return [].concat
      .apply([], records)
      .filter(link => {
        // TODO: Maybe restructure the data model so that groups encapsulate their records, making this filtering unnecessary
        return (
          state.recordLinks[link.id].relationships.group.data.id ===
          instance.relationships.group.data.id
        );
      })
      .map(link => {
        const record = state.recordLinks[link.id].relationships.recordable.data;
        return state[record.type][record.id];
      })
      .filter(record => {
        return chosenSubresources.includes(record.attributes.uid);
      });
  }
};
