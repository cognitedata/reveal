import { useContext, useEffect, useState } from 'react';
import { FlagContext } from './FlagContext';

export const useVariant = (toggleName: string) => {
  const { client } = useContext(FlagContext);
  const [variantValue, setVariantValue] = useState('');

  useEffect(() => {
    if (!client) {
      setVariantValue('');
    } else {
      const variant = client.getVariant(toggleName);
      setVariantValue(variant.payload?.value || '');
    }
  }, [client]);

  return variantValue;
};
