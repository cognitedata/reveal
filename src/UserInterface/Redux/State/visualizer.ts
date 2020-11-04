export interface IVisualizerState {
  viewers: { [key: string]: { [groupId: string]: IToolbarCommandState[] }; },
  statusBar: { text: string }
}

export interface IToolbarCommandState {
  isChecked: boolean;
  value: string;
  isVisible: boolean;
}
