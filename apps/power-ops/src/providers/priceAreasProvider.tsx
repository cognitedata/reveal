import { useState, createContext, useEffect } from 'react';
import { useAuthContext } from '@cognite/react-container';
import { useFetchPriceAreas } from 'queries/useFetchPriceAreas';
import { PriceArea } from 'models/sequences';

export interface PriceAreasContextType {
  priceAreas?: PriceArea[];
}

export const PriceAreasContext = createContext<PriceAreasContextType>({});

export const PriceAreasProvider: React.FC = ({ children }) => {
  const { client, authState } = useAuthContext();

  const { data } = useFetchPriceAreas({
    project: client?.project,
    token: authState?.token,
  });

  const [priceAreas, setContextValue] = useState<PriceAreasContextType>({});

  useEffect(() => {
    setContextValue({ priceAreas: data });
  }, [data]);

  const { Provider } = PriceAreasContext;

  return <Provider value={priceAreas}>{children}</Provider>;
};
