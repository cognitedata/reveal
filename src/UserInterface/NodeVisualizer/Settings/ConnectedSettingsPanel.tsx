import { connect } from "react-redux";
import { Dispatch } from "redux";
import { State } from "@/UserInterface/Redux/State/State";
import { onSettingChange, onExpandChange } from "@/UserInterface/Redux/reducers/SettingsReducer";
import { ISettingsSection } from "@/UserInterface/Components/Settings/Types";
import { ISettingsPropertyState } from "@/UserInterface/Redux/State/settings";
import SettingsPanel from "@/UserInterface/Components/Settings/SettingsPanel";

function mapDispatchToSettingsPanel(dispatch: Dispatch) {
  return {
    onSectionExpand: (id: string, expandStatus: boolean) => {
      dispatch(onExpandChange(id, expandStatus));
    },
    onSettingChange: (id: string, value: any) => {
      dispatch(onSettingChange(id, value));
    }
  };
}

function mapStateToSettingsPanel(state: State) {
  const { currentNodeId, titleBar, properties } = state.settings;
  const sections: ISettingsSection[] = [];
  if (properties && properties.allIds.length) {
    for (const propertyId of properties.allIds) {
      const property = properties.byId[propertyId];

      if (property.children && property.children.length) {
        const section = convertPropertyToSectionObject(propertyId, properties);
        sections.push(section);
      }
    }
  }
  return { id: currentNodeId, titleBar, sections };
}

function convertPropertyToSectionObject(
  propertyId: string,
  allProperties: {
    byId: { [id: string]: ISettingsPropertyState };
    allIds: string[];
  }
): ISettingsSection {
  const property = allProperties.byId[propertyId];

  const section: ISettingsSection = {
    name: property.name,
    isExpanded: !!property.expanded,
    elements: [],
    subSections: []
  };

  if (property.children && property.children.length) {
    for (const childPropertyId of property.children) {
      const childProperty = allProperties.byId[childPropertyId];
      if (childProperty.type) {
        section.elements.push({
          name: childProperty.name,
          type: childProperty.type,
          value: childProperty.value
        });
      } else {
        const childSection = convertPropertyToSectionObject(childPropertyId, allProperties);
        section.subSections.push(childSection);
      }
    }
  }
  return section;
}

export const ConnectedSettingsPanel = connect(
  mapStateToSettingsPanel,
  mapDispatchToSettingsPanel
)(SettingsPanel);
