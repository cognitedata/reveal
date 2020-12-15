// todo: move treeView under toolbar
export type ToolbarState = {
  ghostModeEnabled: boolean;
};

export type GhostModeUpdated = {
  type: 'toolbar/ghostModeUpdated';
  payload: boolean;
};
