import { Button, Modal, TextInput } from '@cognite/cogs.js';
import { CogniteOrnate } from '@cognite/ornate';
import LineReviewHeader from 'components/LineReviewHeader';
import LineReviewViewer from 'components/LineReviewViewer';
import { NullView } from 'components/NullView/NullView';
import useLineReviews from 'modules/lineReviews/hooks';
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';

import { updateLineReviews } from '../modules/lineReviews/api';
import { LineReviewStatus } from '../modules/lineReviews/types';

import { PagePath } from './Menubar';
// import { useAuthContext } from '@cognite/react-container';

const LineReview = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [isReportBackModalOpen, setIsReportBackModalOpen] = useState(false);
  const { isLoading, lineReviews, populateLineReviews } = useLineReviews();
  const [ornateRef, setOrnateRef] = useState<CogniteOrnate | undefined>(
    undefined
  );

  // const { client } = useAuthContext();

  // Populate data
  useEffect(() => {
    populateLineReviews();
  }, []);

  const lineReview = lineReviews.find((lineReview) => lineReview.id === id);
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

  const onReportBackSavePress = () => {
    setIsReportBackModalOpen(false);
    updateLineReviews([
      {
        ...lineReview,
        status: LineReviewStatus.REVIEWED,
      },
    ]);
    history.push(PagePath.LINE_REVIEWS);
  };

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
        footer={null}
      >
        <h2>Report back</h2>
        <p>
          You are about to send this report for further checking. The following
          discrepancies will be included in the report:
        </p>
        <div>
          <b>Branch line connection to 41_N757 not found in ISO</b>
        </div>

        <div>
          MF:{' '}
          <a //eslint-disable-line
            onClick={() => {
              return undefined;
            }}
          >
            RBD_G0040_MF_004
          </a>
        </div>
        <div>
          ISO:{' '}
          <a //eslint-disable-line
            onClick={() => {
              return undefined;
            }}
          >
            G0040-L029-1
          </a>
        </div>

        <br />
        <TextInput placeholder="Comments..." style={{ width: '100%' }} />
        <br />
        <br />
        <footer>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <Button type="ghost" icon="Document" />
            </div>
            <div>
              <Button type="secondary">Cancel</Button>&nbsp;&nbsp;
              <Button type="primary" onClick={onReportBackSavePress}>
                Save
              </Button>
            </div>
          </div>
        </footer>
      </Modal>
      <LineReviewHeader
        lineReview={lineReview}
        ornateRef={ornateRef}
        onReportBackPress={onReportBackPress}
      />
      <LineReviewViewer lineReview={lineReview} onOrnateRef={setOrnateRef} />
    </div>
  );
};

export default LineReview;
