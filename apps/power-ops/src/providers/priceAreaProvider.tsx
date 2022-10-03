import { PropsWithChildren, useState, createContext, useEffect } from 'react';
import { fetchBidProcessResultWithData } from 'queries/useFetchPriceArea';
import { BidProcessResultWithData } from 'types';
import { BidProcessConfiguration } from '@cognite/power-ops-api-types';
import { useQuery, useQueryClient } from 'react-query';
import { useAuthenticatedAuthContext } from '@cognite/react-container';
import { useFetchProcessConfigurations } from 'queries/useFetchProcessConfigurations';

export interface PriceAreasContextType {
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

  const { data: allProcessConfigurations } =
    useFetchProcessConfigurations(priceAreaExternalId);

  const [contextValue, setContextValue] = useState<PriceAreasContextType>({
    priceAreaChanged: updateSelectedPriceArea,
    bidProcessConfigurationChanged: updateSelectedBidProcessConfiguration,
  });

  useEffect(() => {
    setContextValue({
      bidProcessResult: selectedBidProcessResult,
      allProcessConfigurations,
      bidProcessEventExternalId,
      priceAreaChanged: updateSelectedPriceArea,
      bidProcessConfigurationChanged: updateSelectedBidProcessConfiguration,
    });
  }, [selectedBidProcessResult]);

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
