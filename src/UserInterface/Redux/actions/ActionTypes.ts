export default class ActionTypes
{
  //==================================================
  // Common Reducer Actions
  //==================================================
  public static setFullScreenStatus = "SET_FULLSCREEN_STATUS";

  //==================================================
  // Explorer Reducer Actions
  //==================================================
  public static changeSelectState = "settings/onSelectedNodeChange";
  public static GENERATE_NODE_TREE = "GENERATE_NODE_TREE";
  public static CHANGE_SELECTED_TAB = "CHANGE_SELECTED_TAB";
  public static CHANGE_CHECKBOX_STATE = "CHANGE_CHECKBOX_STATE";
  public static CHANGE_SELECT_STATE = "CHANGE_SELECT_STATE";
  public static CHANGE_EXPAND_STATE = "CHANGE_EXPAND_STATE";
  public static CHANGE_ACTIVE_STATE = "CHANGE_ACTIVE_STATE";
  public static CHANGE_NODE_NAME = "CHANGE_NODE_NAME";
  public static CHANGE_NODE_COLOR = "CHANGE_NODE_COLOR";

  //==================================================
  // Visualizers Reducer Actions
  //==================================================
  public static setVisualizerData = "SET_VISUALIZER_DATA";
  public static setStatusPanelText = "SET_STATUS_PANEL_TEXT";
  public static executeVisualizerToolbarCommand = "EXECUTE_VISUALIZER_TOOLBAR_COMMAND";
  public static executeVisualizerToolbarCommandSuccess = "EXECUTE_VISUALIZER_TOOLBAR_COMMAND_SUCCESS";
  public static selectOnChange = "SELECT_ON_CHANGE";
}
