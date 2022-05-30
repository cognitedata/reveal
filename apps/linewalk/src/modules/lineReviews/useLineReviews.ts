import { useAuthContext } from '@cognite/react-container';
import { LineReview } from 'modules/lineReviews/types';
import { useContext, useEffect, useState } from 'react';

import SiteContext from '../../components/SiteContext/SiteContext';

import { getLineReviews } from './api';

const useLineReviews = (unit: string | undefined) => {
  const { client } = useAuthContext();
  const { site } = useContext(SiteContext);

  const [isLoading, setIsLoading] = useState(true);
  const [lineReviews, setLineReviews] = useState<LineReview[]>([]);
  useEffect(() => {
    if (client === undefined) {
      return;
    }

    (async () => {
      if (unit === undefined) {
        return;
      }

      setIsLoading(true);
      const lineReviews = await getLineReviews(client, site, unit);
      setLineReviews(lineReviews);
      setIsLoading(false);
    })();
  }, [client, unit]);

  return {
    isLoading,
    lineReviews,
  };
};

export default useLineReviews;
