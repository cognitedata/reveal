export interface WellboreNavigationPanelProps<
  T extends NavigationPanelDataType
> {
  data: T[];
  currentWellboreName?: string;
  onNavigate?: ({
    data,
    wellboreName,
  }: {
    data: T[];
    wellboreName: string;
  }) => void;
  onBackClick: () => void;
  disableNavigation?: boolean;
}

export interface NavigationPanelDataType {
  wellboreMatchingId: string;
  wellName: string;
  wellboreName: string;
}
