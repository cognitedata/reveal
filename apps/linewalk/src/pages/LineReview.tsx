import { Button, Modal, TextInput } from '@cognite/cogs.js';
import { NullView } from 'components/NullView/NullView';
import useLineReviews from 'modules/lineReviews/hooks';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import LineReviewViewer from 'components/LineReviewViewer';
import LineReviewHeader from 'components/LineReviewHeader';
// import { useAuthContext } from '@cognite/react-container';

const LineReview = () => {
  const { id } = useParams<{ id: string }>();
  const [isReportBackModalOpen, setIsReportBackModalOpen] = useState(false);
  const { isLoading, lineReviews, populateLineReviews } = useLineReviews();

  // const { client } = useAuthContext();

  // Populate data
  useEffect(() => {
    populateLineReviews();
  }, []);

  const lineReview = lineReviews.find((lineReview) => lineReview.id === id);
  console.log({
    id,
    lineReview,
    lineReviews,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!lineReview) {
    return (
      <div>
        <NullView type="noLineReview" />
      </div>
    );
  }

  const onReportBackPress = () => setIsReportBackModalOpen(true);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Modal
        visible={isReportBackModalOpen}
        onCancel={() => {
          setIsReportBackModalOpen(false);
        }}
      >
        <h2>Report back</h2>
        <p>
          You are about to send this report for further checking. The following
          discrepancies will be included in the report:
        </p>
        <div>Branch line connection to 41_N757 not found in ISO</div>

        <div>MF: RBD_G0040_MF_004</div>
        <div>ISO: G0040-L029-1</div>

        <TextInput placeholder="Comments..." />

        <Button type="ghost" icon="Pdf" />
        <Button type="ghost">Cancel</Button>
        <Button type="primary">Save</Button>
      </Modal>
      <LineReviewHeader
        lineReview={lineReview}
        onReportBackPress={onReportBackPress}
      />
      <LineReviewViewer lineReview={lineReview} />
    </div>
  );
};

export default LineReview;
