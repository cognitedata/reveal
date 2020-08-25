import { connect } from "react-redux";
import { State } from "@/UserInterface/Redux/State/State";
import SettingsPanel from "@/UserInterface/Components/Settings/SettingsPanel";
import SettingsNodeUtils from "./SettingsNodeUtils";

function mapDispatchToSettingsPanel() {
  return {
    onSectionExpand: () => {
      // TODO: Implement this feature
      // dispatch(onExpandChange(id, expandStatus));
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
  const { currentNodeId, titleBar } = state.settings;

  return { id: currentNodeId, titleBar };
}

export const ConnectedSettingsPanel = connect(
  mapStateToSettingsPanel,
  mapDispatchToSettingsPanel
)(SettingsPanel);
