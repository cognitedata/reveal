export interface ViewModeControlProps<T> {
  views: T[];
  selectedView: T;
  onChangeView: (view: T) => void;
}
