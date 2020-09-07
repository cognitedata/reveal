import { connect } from "react-redux";
import { State } from "@/UserInterface/Redux/State/State";
import { SettingsPanel } from "@/UserInterface/Components/Settings/SettingsPanel";
import { onSectionExpand } from "@/UserInterface/Redux/reducers/SettingsReducer";
import { Dispatch } from "redux";
import { SettingsNodeUtils } from "@/UserInterface/NodeVisualizer/Settings/SettingsNodeUtils";

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
  const {
    currentNodeId,
    titleBar,
    expandedSections,
    updateUICount,
  } = state.settings;
  return { id: currentNodeId, titleBar, expandedSections, updateUICount };
}

export const ConnectedSettingsPanel = connect(
  mapStateToSettingsPanel,
  mapDispatchToSettingsPanel
)(SettingsPanel);
