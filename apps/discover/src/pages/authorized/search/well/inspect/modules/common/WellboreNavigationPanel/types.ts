export interface WellboreNavigationPanelProps<
  T extends NavigationPanelDataType
> {
  data: T[];
  currentWellboreName?: string;
  onNavigate?: (data: T[]) => void;
  onChangeData?: (updatedDataForCurrentWellbore?: T[]) => void;
  onClickBack: () => void;
  disableNavigation?: boolean;
}

export interface NavigationPanelDataType {
  wellName: string;
  wellboreName: string;
}
