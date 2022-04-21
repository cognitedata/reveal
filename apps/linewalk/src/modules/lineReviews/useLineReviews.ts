import uniq from 'lodash/uniq';
import { useAuthContext } from '@cognite/react-container';
import { LineReview, LineReviewStatus } from 'modules/lineReviews/types';
import { useEffect, useState } from 'react';

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
    statuses: [
      LineReviewStatus.OPEN,
      LineReviewStatus.REVIEWED,
      LineReviewStatus.COMPLETED,
    ],
    assignees: uniq(
      lineReviews.flatMap((lineReview) =>
        lineReview.assignees.map((assignee) => assignee.name)
      )
    ),
  };
};

export default useLineReviews;
