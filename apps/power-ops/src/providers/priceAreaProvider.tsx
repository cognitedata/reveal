import { useState, createContext, useEffect } from 'react';
import {
  useFetchAllPriceAreas,
  fetchPriceArea,
  fetchProcessConfigurations,
} from 'queries/useFetchPriceArea';
import { PriceAreaWithData } from 'types';
import { AuthenticatedUser } from '@cognite/auth-utils';
import { CogniteClient } from '@cognite/sdk';
import {
  PriceArea,
  BidProcessConfiguration,
} from '@cognite/power-ops-api-types';
import { useQuery } from 'react-query';

interface PriceAreaProviderProps {
  client: CogniteClient;
  authState: AuthenticatedUser;
}
export interface PriceAreasContextType {
  allPriceAreas?: PriceArea[];
  priceArea?: PriceAreaWithData;
  allProcessConfigurations?: BidProcessConfiguration[];
  bidProcessEventExternalId?: string;
  priceAreaChanged: (priceAreaExternalId: string) => any;
  bidProcessConfigurationChanged: (bidProcessEventExternalId: string) => any;
}

export const PriceAreasContext = createContext<PriceAreasContextType>({
  priceAreaChanged: () => false,
  bidProcessConfigurationChanged: () => false,
});

export const PriceAreaProvider: React.FC<PriceAreaProviderProps> = ({
  children,
  client,
  authState,
}) => {
  const [priceAreaExternalId, setPriceExternalId] = useState<string>('');
  const updateSelectedPriceArea = (priceAreaExternalId: string) => {
    setPriceExternalId(priceAreaExternalId);
  };
  const [bidProcessEventExternalId, setBidProcessEventExternalId] =
    useState<string>('');
  const updateSelectedBidProcessConfiguration = (
    bidProcessEventExternalId: string
  ) => {
    setBidProcessEventExternalId(bidProcessEventExternalId);
  };

  const { data: allPriceAreas } = useFetchAllPriceAreas({
    client,
    token: authState.token!,
  });

  const { data: selectedPriceArea, refetch: refetchPriceArea } = useQuery(
    [
      `${client.project}_priceAreaData_${priceAreaExternalId}_${bidProcessEventExternalId}`,
    ],
    () =>
      fetchPriceArea({
        client,
        token: authState.token!,
        priceAreaExternalId,
        bidProcessEventExternalId,
      }),
    { enabled: !!priceAreaExternalId }
  );

  const {
    data: allProcessConfigurations,
    refetch: refetchProcessConfigurations,
  } = useQuery(
    [`${client.project}_processConfigurations_${priceAreaExternalId}`],
    () =>
      fetchProcessConfigurations({
        priceAreaExternalId,
        client,
        token: authState.token!,
      }),
    { enabled: !!priceAreaExternalId }
  );

  const [contextValue, setContextValue] = useState<PriceAreasContextType>({
    priceAreaChanged: updateSelectedPriceArea,
    bidProcessConfigurationChanged: updateSelectedBidProcessConfiguration,
  });

  useEffect(() => {
    setContextValue({
      allPriceAreas,
      priceArea: selectedPriceArea,
      allProcessConfigurations,
      bidProcessEventExternalId,
      priceAreaChanged: updateSelectedPriceArea,
      bidProcessConfigurationChanged: updateSelectedBidProcessConfiguration,
    });
  }, [allPriceAreas, selectedPriceArea, allProcessConfigurations]);

  useEffect(() => {
    if (priceAreaExternalId) {
      refetchPriceArea();
      refetchProcessConfigurations();
    }
  }, [priceAreaExternalId, bidProcessEventExternalId]);

  useEffect(() => {
    if (!bidProcessEventExternalId && allProcessConfigurations) {
      setBidProcessEventExternalId(
        allProcessConfigurations[0].bidProcessEventExternalId
      );
    }
  }, [bidProcessEventExternalId, allProcessConfigurations]);

  const { Provider } = PriceAreasContext;

  return <Provider value={contextValue}>{children}</Provider>;
};
