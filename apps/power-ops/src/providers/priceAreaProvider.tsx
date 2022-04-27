import { useState, createContext, useEffect } from 'react';
import {
  useFetchAllPriceAreas,
  fetchPriceArea,
} from 'queries/useFetchPriceArea';
import { PriceAreaWithData } from 'types';
import { AuthenticatedUser } from '@cognite/auth-utils';
import { CogniteClient } from '@cognite/sdk';
import { PriceArea } from '@cognite/power-ops-api-types';
import { useQuery } from 'react-query';

interface PriceAreaProviderProps {
  client: CogniteClient;
  authState: AuthenticatedUser;
}
export interface PriceAreasContextType {
  allPriceAreas?: PriceArea[];
  priceArea?: PriceAreaWithData;
  priceAreaChanged: (priceAreaExternalId: string) => any;
}

export const PriceAreasContext = createContext<PriceAreasContextType>({
  priceAreaChanged: () => false,
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

  const { data: allPriceAreas } = useFetchAllPriceAreas({
    client,
    token: authState.token!,
  });

  const { data: selectedPriceArea, refetch } = useQuery(
    [`${client.project}_priceAreaData_${priceAreaExternalId}`],
    () =>
      fetchPriceArea({ priceAreaExternalId, client, token: authState.token! }),
    { enabled: !!priceAreaExternalId }
  );

  const [contextValue, setContextValue] = useState<PriceAreasContextType>({
    priceAreaChanged: updateSelectedPriceArea,
  });

  useEffect(() => {
    setContextValue({
      allPriceAreas,
      priceArea: selectedPriceArea,
      priceAreaChanged: updateSelectedPriceArea,
    });
  }, [allPriceAreas, selectedPriceArea]);

  useEffect(() => {
    if (priceAreaExternalId) {
      refetch();
    }
  }, [priceAreaExternalId]);

  const { Provider } = PriceAreasContext;

  return <Provider value={contextValue}>{children}</Provider>;
};
