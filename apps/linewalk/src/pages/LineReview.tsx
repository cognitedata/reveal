import { Button, Modal, TextInput } from '@cognite/cogs.js';
import { CogniteOrnate } from '@cognite/ornate';
import { useAuthContext } from '@cognite/react-container';
import LineReviewHeader from 'components/LineReviewHeader';
import LineReviewViewer from 'components/LineReviewViewer';
import { NullView } from 'components/NullView/NullView';
import useLineReviews from 'modules/lineReviews/hooks';
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';

import getUniqueDocumentsByDiscrepancy from '../components/LineReviewViewer/getUniqueDocumentsByDiscrepancy';
import { Discrepancy } from '../components/LineReviewViewer/LineReviewViewer';
import mapPidAnnotationIdsToIsoAnnotationIds from '../components/LineReviewViewer/mapPidAnnotationIdsToIsoAnnotationIds';
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
  const [discrepancies, setDiscrepancies] = useState<Discrepancy[]>([]);

  const { client } = useAuthContext();

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
            lineReview.documents,
            mapPidAnnotationIdsToIsoAnnotationIds(
              lineReview.documents,
              discrepancy.ids
            )
          ).filter((document) => document.type === 'ISO');
          const usedDiscrepancyIsos =
            uniqueDiscrepancyIsos.length === 0
              ? lineReview.documents.filter(
                  (document) => document.type === 'ISO'
                )
              : uniqueDiscrepancyIsos;
          return (
            <div key={discrepancy.id}>
              <div>
                <b>{discrepancy.comment}</b>
              </div>

              <div>
                <b>MF:</b>{' '}
                {getUniqueDocumentsByDiscrepancy(
                  lineReview.documents,
                  discrepancy.ids
                )
                  .filter((document) => document.type === 'PID')
                  .map((document) => (
                    <>
                      <a //eslint-disable-line
                        onClick={() => {
                          return undefined;
                        }}
                      >
                        {document.fileExternalId}
                      </a>{' '}
                    </>
                  ))}
              </div>
              <div>
                <b>ISO:</b>{' '}
                {usedDiscrepancyIsos
                  .filter((document) => document.type === 'ISO')
                  .map((document) => (
                    <>
                      <a //eslint-disable-line
                        onClick={() => {
                          return undefined;
                        }}
                      >
                        {document.fileExternalId}
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
                icon="Document"
                onClick={() => ornateRef?.onExport()}
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
        ornateRef={ornateRef}
        onReportBackPress={onReportBackPress}
      />
      <LineReviewViewer
        discrepancies={discrepancies}
        onDiscrepancyChange={setDiscrepancies}
        lineReview={lineReview}
        onOrnateRef={setOrnateRef}
      />
    </div>
  );
};

export default LineReview;
