export default {
  language: state => {
    return state.settings.system_language != undefined
      ? state.settings.system_language.attributes.value
      : "enGb";
  },
  widgetForInstance: state => instance => {
    return state.widgets[instance.relationships.widget.data.id];
  },
  // FIXME: This is some monstrous filter logic.
  recordsForWidgetInstance: (state, getters) => instance => {
    // Return early if the widget has no group, and thus no records.
    if (instance.relationships.group === null) return [];

    // TODO: Can this be written more concise?
    const sourceInstances = instance.relationships.sourceInstances.data;

    let records = [];
    for (let si of sourceInstances) {
      if (state.sourceInstances[si.id]) {
        records.push(
          state.sourceInstances[si.id].relationships.recordLinks.data
        );
      }
    }
    // .flat() not supported by WPE fork yet
    records = [].concat
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
      });

    if (getters.widgetForInstance(instance).attributes.singleSource) {
      return records;
    } else {
      const chosenSubresources = [].concat(
        ...instance.relationships.instanceAssociations.data.reduce(
          (acc, ia) => {
            if (state.instanceAssociations[ia.id]) {
              acc.push(
                state.instanceAssociations[ia.id].attributes.configuration
                  .chosen
              );
            }
            return acc;
          },
          []
        )
      );
      return records.filter(record => {
        return chosenSubresources.includes(record.attributes.uid);
      });
    }
  }
};
