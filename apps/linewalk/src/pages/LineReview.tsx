import { NullView } from 'components/NullView/NullView';
import useLineReviews from 'modules/lineReviews/hooks';
import { useEffect } from 'react';
import { useParams } from 'react-router';
import LineReviewViewer from 'components/LineReviewViewer';
import LineReviewHeader from 'components/LineReviewHeader';

const LineReview = () => {
  const { id } = useParams<{ id: string }>();
  const { lineReviews, populateLineReviews } = useLineReviews();

  // Populate data
  useEffect(() => {
    populateLineReviews();
  }, []);

  const lineReview = lineReviews.find((lineReview) => lineReview.id === id);

  if (!lineReview) {
    return (
      <div>
        <NullView type="noLineReview" />
      </div>
    );
  }
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <LineReviewHeader lineReview={lineReview} />
      <LineReviewViewer lineReview={lineReview} />
    </div>
  );
};

export default LineReview;
