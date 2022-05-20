export interface WellboreNavigationPanelProps<
  T extends NavigationPanelDataType
> {
  data: T[];
  currentWellboreName?: string;
  onNavigate?: (data: T[]) => void;
  onClickBack: () => void;
  disableNavigation?: boolean;
}

export interface NavigationPanelDataType {
  wellName: string;
  wellboreName: string;
}
