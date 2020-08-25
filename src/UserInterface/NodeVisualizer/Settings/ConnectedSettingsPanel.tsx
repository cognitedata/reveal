import { connect } from "react-redux";
import { State } from "@/UserInterface/Redux/State/State";
import SettingsPanel from "@/UserInterface/Components/Settings/SettingsPanel";
import { onSectionExpand } from "@/UserInterface/Redux/reducers/SettingsReducer";
import { Dispatch } from "redux";
import SettingsNodeUtils from "./SettingsNodeUtils";

function mapDispatchToSettingsPanel(dispatch: Dispatch) {
  return {
    onSectionExpand: (sectionName, expandStatus) => {
      dispatch(onSectionExpand(sectionName, expandStatus));
    },
    onPropertyValueChange: (id: string, value: any) => {
      SettingsNodeUtils.setPropertyValue<string>(id, value);
    },
    onPropertyUseChange: (id: string, value: boolean) => {
      SettingsNodeUtils.setPropertyUse(id, value);
    },
  };
}

function mapStateToSettingsPanel(state: State) {
  const { currentNodeId, titleBar, expandedSections } = state.settings;
  return { id: currentNodeId, titleBar, expandedSections };
}

export const ConnectedSettingsPanel = connect(
  mapStateToSettingsPanel,
  mapDispatchToSettingsPanel
)(SettingsPanel);
