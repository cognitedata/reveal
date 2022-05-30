import { Loader } from '@cognite/cogs.js';
import { useAuthContext } from '@cognite/react-container';
import React, { useEffect, useMemo } from 'react';

import { getSites, getUnits } from '../../modules/lineReviews/api';
import { LoaderContainer } from '../../pages/elements';
import shamefulPendingPromise from '../../utils/shamefulPendingPromise';
import useFetch from '../../utils/useFetch';
import usePersistedQueryParamValue from '../../utils/usePersistedQueryParamValue';

import SiteContext, { EMPTY_SITE_VALUE } from './SiteContext';

const useSites = () => {
  const { client } = useAuthContext();
  const { isLoading, data: availableSites } = useFetch<string[]>(
    () => (client ? getSites(client) : shamefulPendingPromise()),
    [],
    [client]
  );

  const [site, setSite] = usePersistedQueryParamValue(
    isLoading,
    'site',
    (site) => availableSites.includes(site)
  );

  useEffect(() => {
    if (availableSites.length === 0) {
      console.warn(
        'No sites available - project is probably not set  up correctly.'
      );
    }

    if (availableSites.length > 0 && site === EMPTY_SITE_VALUE) {
      setSite(availableSites[0]);
    }
  }, [site, availableSites]);

  return {
    isLoading,
    site,
    setSite,
    availableSites,
  };
};

const useUnits = ({ site }: { site: string }) => {
  const { client } = useAuthContext();
  const { isLoading, data: availableUnits } = useFetch<string[]>(
    () => (client ? getUnits(client, site) : shamefulPendingPromise()),
    [],
    [client, site]
  );

  const [unit, setUnit] = usePersistedQueryParamValue(
    isLoading,
    'unit',
    (unit) => availableUnits.includes(unit)
  );

  return {
    isLoading,
    unit,
    setUnit,
    availableUnits,
  };
};

const SiteContextProvider: React.FC = ({ children }) => {
  const {
    isLoading: areSitesLoading,
    site,
    setSite,
    availableSites,
  } = useSites();
  const {
    isLoading: areUnitsLoading,
    unit,
    setUnit,
    availableUnits,
  } = useUnits({ site });

  const context = useMemo(
    () => ({
      isLoading: areSitesLoading || areUnitsLoading,
      availableSites,
      site,
      setSite,
      availableUnits,
      unit,
      setUnit,
    }),
    [
      areSitesLoading,
      areUnitsLoading,
      site,
      setSite,
      availableSites,
      availableUnits,
      unit,
      setUnit,
    ]
  );

  if (site === EMPTY_SITE_VALUE) {
    return (
      <LoaderContainer>
        <Loader infoTitle="Loading site data..." darkMode={false} />
      </LoaderContainer>
    );
  }

  return (
    <SiteContext.Provider value={context}>{children}</SiteContext.Provider>
  );
};

export default SiteContextProvider;
