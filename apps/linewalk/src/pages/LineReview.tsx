import { Button, Loader, Modal, TextInput } from '@cognite/cogs.js';
import { CogniteOrnate } from '@cognite/ornate';
import { useAuthContext } from '@cognite/react-container';
import LineReviewHeader from 'components/LineReviewHeader';
import LineReviewViewer from 'components/LineReviewViewer';
import { NullView } from 'components/NullView/NullView';
import { useState } from 'react';
import { useHistory, useParams } from 'react-router';
import styled from 'styled-components';

import exportDocumentsToPdf from '../components/LineReviewViewer/exportDocumentsToPdf';
import getUniqueDocumentsByDiscrepancy from '../components/LineReviewViewer/getUniqueDocumentsByDiscrepancy';
import { Discrepancy } from '../components/LineReviewViewer/LineReviewViewer';
import mapPidAnnotationIdsToIsoAnnotationIds from '../components/LineReviewViewer/mapPidAnnotationIdsToIsoAnnotationIds';
import { updateLineReviews } from '../modules/lineReviews/api';
import { DocumentType, LineReviewStatus } from '../modules/lineReviews/types';
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
  const [discrepancies, setDiscrepancies] = useState<Discrepancy[]>([]);

  const { client } = useAuthContext();

  const { isLoading, lineReview, documents } = useLineReview(id);
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

  const onReportBackSavePress = async () => {
    setIsReportBackModalOpen(false);

    if (client && discrepancies.length > 0) {
      await client.events.create(
        discrepancies.map((discrepancy) => ({
          type: 'discrepancy',
          startTime: new Date(),
          endTime: new Date(),
          assetIds: [5375761618838894], // Hardcoded asset for L132.
          metadata: {},
          description: discrepancy.comment,
        }))
      );
    }

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
        onCancel={() => setIsReportBackModalOpen(false)}
        footer={null}
      >
        <h2>Report back</h2>
        <p>
          You are about to send this report for further checking. The following
          discrepancies will be included in the report:
        </p>

        {discrepancies.length === 0 && (
          <p>
            <b>No discrepancies marked yet</b>
          </p>
        )}

        {discrepancies.map((discrepancy) => {
          const uniqueDiscrepancyIsos = getUniqueDocumentsByDiscrepancy(
            documents,
            mapPidAnnotationIdsToIsoAnnotationIds(documents, discrepancy.ids)
          ).filter((document) => document.type === DocumentType.ISO);
          const usedDiscrepancyIsos =
            uniqueDiscrepancyIsos.length === 0
              ? documents.filter(
                  (document) => document.type === DocumentType.ISO
                )
              : uniqueDiscrepancyIsos;
          return (
            <div key={discrepancy.id}>
              <div>
                <b>{discrepancy.comment}</b>
              </div>

              <div>
                <b>MF:</b>{' '}
                {getUniqueDocumentsByDiscrepancy(documents, discrepancy.ids)
                  .filter((document) => document.type === DocumentType.PID)
                  .map((document) => (
                    <>
                      <a //eslint-disable-line
                        onClick={() => {
                          return undefined;
                        }}
                      >
                        {document.pdfExternalId}
                      </a>{' '}
                    </>
                  ))}
              </div>
              <div>
                <b>ISO:</b>{' '}
                {usedDiscrepancyIsos
                  .filter((document) => document.type === DocumentType.ISO)
                  .map((document) => (
                    <>
                      <a //eslint-disable-line
                        onClick={() => {
                          return undefined;
                        }}
                      >
                        {document.pdfExternalId}
                      </a>{' '}
                    </>
                  ))}
              </div>
              <br />
            </div>
          );
        })}

        <br />
        <TextInput placeholder="Comments..." style={{ width: '100%' }} />
        <br />
        <br />
        <footer>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <Button
                type="ghost"
                icon="Print"
                onClick={() =>
                  ornateRef
                    ? exportDocumentsToPdf(ornateRef, documents, discrepancies)
                    : undefined
                }
              />
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
