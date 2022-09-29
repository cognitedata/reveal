import { PropsWithChildren, useState, createContext, useEffect } from 'react';
import {
  useFetchAllPriceAreas,
  fetchBidProcessResultWithData,
  fetchProcessConfigurations,
} from 'queries/useFetchPriceArea';
import { BidProcessResultWithData } from 'types';
import {
  PriceArea,
  BidProcessConfiguration,
} from '@cognite/power-ops-api-types';
import { useQuery, useQueryClient } from 'react-query';
import { useAuthenticatedAuthContext } from '@cognite/react-container';

export interface PriceAreasContextType {
  allPriceAreas?: PriceArea[];
  bidProcessResult?: BidProcessResultWithData;
  allProcessConfigurations?: BidProcessConfiguration[];
  bidProcessEventExternalId?: string;
  priceAreaChanged: (priceAreaExternalId: string) => any;
  bidProcessConfigurationChanged: (bidProcessEventExternalId: string) => any;
}

export const PriceAreasContext = createContext<PriceAreasContextType>({
  priceAreaChanged: () => false,
  bidProcessConfigurationChanged: () => false,
});

export const PriceAreaProvider = ({ children }: PropsWithChildren) => {
  const { client, authState } = useAuthenticatedAuthContext();
  const queryClient = useQueryClient();

  const [priceAreaExternalId, setPriceAreaExternalId] = useState<string>('');
  const updateSelectedPriceArea = (newId: string) => {
    if (newId !== priceAreaExternalId) {
      setPriceAreaExternalId(newId);
    }
  };
  const [bidProcessEventExternalId, setBidProcessEventExternalId] =
    useState<string>('');
  const updateSelectedBidProcessConfiguration = (newId: string) => {
    if (newId !== bidProcessEventExternalId) {
      setBidProcessEventExternalId(newId);
    }
  };

  const { data: allPriceAreas } = useFetchAllPriceAreas();

  const { data: selectedBidProcessResult, refetch: refetchBidProcessResult } =
    useQuery(
      [
        `${client.project}_priceAreaData_${priceAreaExternalId}_${bidProcessEventExternalId}`,
      ],
      () =>
        fetchBidProcessResultWithData({
          client,
          queryClient,
          token: authState.token!,
          priceAreaExternalId,
          bidProcessEventExternalId,
        }),
      {
        enabled: !!(
          priceAreaExternalId &&
          bidProcessEventExternalId &&
          queryClient
        ),
      }
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
      bidProcessResult: selectedBidProcessResult,
      allProcessConfigurations,
      bidProcessEventExternalId,
      priceAreaChanged: updateSelectedPriceArea,
      bidProcessConfigurationChanged: updateSelectedBidProcessConfiguration,
    });
  }, [allPriceAreas, selectedBidProcessResult]);

  useEffect(() => {
    if (priceAreaExternalId) {
      refetchProcessConfigurations();
    }
  }, [priceAreaExternalId]);

  useEffect(() => {
    if (bidProcessEventExternalId) {
      refetchBidProcessResult();
    }
  }, [bidProcessEventExternalId]);

  useEffect(() => {
    if (allProcessConfigurations?.length) {
      setBidProcessEventExternalId(
        allProcessConfigurations[0].bidProcessEventExternalId
      );
    }
  }, [allProcessConfigurations]);

  const { Provider } = PriceAreasContext;

  return <Provider value={contextValue}>{children}</Provider>;
};
