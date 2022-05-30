import React from 'react';

export const EMPTY_SITE_VALUE = '';

const SiteContext = React.createContext<{
  availableSites: string[];
  site: string;
  setSite: (site: string) => void;
  availableUnits: string[];
  unit: string;
  setUnit: (site: string) => void;
  isLoading: boolean;
}>({
  availableSites: [],
  site: EMPTY_SITE_VALUE,
  setSite: () => {
    return undefined;
  },
  availableUnits: [],
  unit: EMPTY_SITE_VALUE,
  setUnit: () => {
    return undefined;
  },
  isLoading: false,
});

export default SiteContext;
