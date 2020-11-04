export class ActionTypes {
  //= =================================================
  // Common Reducer Actions
  //= =================================================
  public static readonly setFullScreenStatus = "SET_FULLSCREEN_STATUS";

  //= =================================================
  // Explorer Reducer Actions
  //= =================================================
  public static readonly changeSelectState = "settings/onSelectedNodeChange";

  //= =================================================
  // Settings Reducer Actions
  //= =================================================
  public static readonly changeNodeName = "explorer/onNodeNameChange";

  public static readonly changeNodeColor = "explorer/onNodeColorChange";

  public static readonly changeNodeIcon = "explorer/onNodeIconChange";

  //= =================================================
  // Visualizers Reducer Actions
  //= =================================================
  public static readonly setVisualizerData = "SET_VISUALIZER_DATA";

  public static readonly setStatusPanelText = "SET_STATUS_PANEL_TEXT";

  public static readonly executeVisualizerToolbarCommand = "EXECUTE_VISUALIZER_TOOLBAR_COMMAND";

  public static readonly executeVisualizerToolbarCommandSuccess = "EXECUTE_VISUALIZER_TOOLBAR_COMMAND_SUCCESS";

  public static readonly selectOnChange = "SELECT_ON_CHANGE";
}
