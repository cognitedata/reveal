import { LineReview } from 'modules/lineReviews/types';
import { useState } from 'react';
import { toast } from '@cognite/cogs.js';

import { getLineReviews, updateLineReviews } from './api';

const useLineReviews = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [lineReviews, setLineReviews] = useState<LineReview[]>([]);
  const populateLineReviews = async () => {
    const lineReviews = await getLineReviews();
    setLineReviews(lineReviews);
    setIsLoading(false);
  };
  const updateLineReview = async (nextLineReview: LineReview) => {
    await updateLineReviews([nextLineReview]);
    await populateLineReviews();
    toast.success({ message: 'LineReview updated!' });
  };

  return {
    isLoading,
    lineReviews,
    populateLineReviews,
    updateLineReview,
  };
};

export default useLineReviews;
