export interface WellboreNavigationPanelProps<
  T extends NavigationPanelDataType
> {
  data: T[];
  currentWellboreName?: string;
  currentWellboreMatchingId?: string;
  onNavigate?: ({
    data,
    wellboreMatchingId,
  }: {
    data: T[];
    wellboreMatchingId: string;
  }) => void;
  onBackClick: () => void;
  disableNavigation?: boolean;
}

export interface NavigationPanelDataType {
  wellboreMatchingId: string;
  wellName: string;
  wellboreName: string;
}
