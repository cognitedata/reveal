export interface WellboreNavigationPanelProps {
  data?: NavigationPanelData;
  wellboreIds?: string[];
  onNavigate?: (wellboreId: string) => void;
  onBackClick: () => void;
  disableNavigation?: boolean;
}

export interface NavigationPanelData {
  wellboreMatchingId: string;
  wellName: string;
  wellboreName: string;
}
