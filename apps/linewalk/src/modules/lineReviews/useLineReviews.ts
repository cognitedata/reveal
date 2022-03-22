import { useEffect, useState } from 'react';
import { useAuthContext } from '@cognite/react-container';
import { LineReview } from 'modules/lineReviews/types';

import { getLineReviews } from './api';

const useLineReviews = () => {
  const { client } = useAuthContext();

  const [isLoading, setIsLoading] = useState(true);
  const [lineReviews, setLineReviews] = useState<LineReview[]>([]);
  useEffect(() => {
    if (client === undefined) {
      return;
    }
    (async () => {
      const lineReviews = await getLineReviews(client);
      setLineReviews(lineReviews);
      setIsLoading(false);
    })();
  }, [client]);

  return {
    isLoading,
    lineReviews,
  };
};

export default useLineReviews;
