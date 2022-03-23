import { Loader } from '@cognite/cogs.js';
import { CogniteOrnate } from '@cognite/ornate';
import { useAuthContext } from '@cognite/react-container';
import LineReviewHeader from 'components/LineReviewHeader';
import LineReviewViewer from 'components/LineReviewViewer';
import { NullView } from 'components/NullView/NullView';
import { useState } from 'react';
import { useHistory, useParams } from 'react-router';
import styled from 'styled-components';

import exportDocumentsToPdf from '../components/LineReviewViewer/exportDocumentsToPdf';
import ReportBackModal from '../components/ReportBackModal';
import {
  saveLineReviewState,
  updateLineReviews,
} from '../modules/lineReviews/api';
import { LineReviewStatus } from '../modules/lineReviews/types';
import useLineReview from '../modules/lineReviews/useLineReview';

import { PagePath } from './Menubar';
// import { useAuthContext } from '@cognite/react-container';

export const LoaderContainer = styled.div`
  position: relative;
  width: 100%;
  height: 50vh;
  min-height: 300px;

  > div {
    position: absolute;
  }
`;

const LineReview = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [isReportBackModalOpen, setIsReportBackModalOpen] = useState(false);
  const [ornateRef, setOrnateRef] = useState<CogniteOrnate | undefined>(
    undefined
  );

  const { client } = useAuthContext();
  const { isLoading, lineReview, documents, discrepancies, setDiscrepancies } =
    useLineReview(id);

  if (isLoading) {
    return (
      <LoaderContainer>
        <Loader infoTitle="Loading line data..." darkMode={false} />
      </LoaderContainer>
    );
  }

  if (!lineReview || !documents) {
    return (
      <div>
        <NullView type="noLineReview" />
      </div>
    );
  }

  const onReportBackPress = () => setIsReportBackModalOpen(true);

  const onReportBackSavePress = async ({ comment }: { comment: string }) => {
    setIsReportBackModalOpen(false);

    if (client === undefined) {
      return;
    }

    await saveLineReviewState(client, lineReview, { discrepancies });

    await updateLineReviews(client, {
      ...lineReview,
      comment,
      status: LineReviewStatus.COMPLETED,
    });
    history.push(PagePath.LINE_REVIEWS);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {ornateRef !== undefined && (
        <ReportBackModal
          isOpen={isReportBackModalOpen}
          initialComment={lineReview.comment}
          documents={documents}
          ornateRef={ornateRef}
          discrepancies={discrepancies}
          onCancelPress={() => setIsReportBackModalOpen(false)}
          onSave={onReportBackSavePress}
        />
      )}
      <LineReviewHeader
        lineReview={lineReview}
        onSaveToPdfPress={() =>
          ornateRef
            ? exportDocumentsToPdf(ornateRef, documents, discrepancies)
            : undefined
        }
        onReportBackPress={onReportBackPress}
      />
      <LineReviewViewer
        lineReview={lineReview}
        discrepancies={discrepancies}
        onDiscrepancyChange={setDiscrepancies}
        documents={documents}
        onOrnateRef={setOrnateRef}
      />
    </div>
  );
};

export default LineReview;
