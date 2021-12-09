import { LineReview } from 'modules/lineReviews/types';
import { useState } from 'react';
import { toast } from '@cognite/cogs.js';

import { fetchLineReviews, updateLineReviews } from './api';

const useLineReviews = () => {
  const [lineReviews, setLineReviews] = useState<LineReview[]>([]);
  const populateLineReviews = async () => {
    const lineReviews = await fetchLineReviews();
    setLineReviews(lineReviews);
  };
  const updateLineReview = async (nextLineReview: LineReview) => {
    await updateLineReviews([nextLineReview]);
    await populateLineReviews();
    toast.success({ message: 'LineReview updated!' });
  };

  return {
    lineReviews,
    populateLineReviews,
    updateLineReview,
  };
};

export default useLineReviews;
