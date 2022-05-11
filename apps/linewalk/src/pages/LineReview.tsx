import { Loader, CollapsablePanel } from '@cognite/cogs.js';
import { CogniteOrnate } from '@cognite/ornate';
import { useAuthContext } from '@cognite/react-container';
import LineReviewHeader from 'components/LineReviewHeader';
import LineReviewViewer from 'components/LineReviewViewer';
import { NullView } from 'components/NullView/NullView';
import SidePanel from 'components/SidePanel/SidePanel';
import Konva from 'konva';
import { useState } from 'react';
import { useHistory, useParams } from 'react-router';
import styled from 'styled-components';
import clamp from 'lodash/clamp';

import exportDocumentsToPdf from '../components/LineReviewViewer/exportDocumentsToPdf';
import { DiscrepancyInteractionHandler } from '../components/LineReviewViewer/types';
import ReportBackModal from '../components/ReportBackModal';
import { updateLineReview } from '../modules/lineReviews/api';
import getExportableLineState from '../modules/lineReviews/getExportableLineState';
import { LineReviewStatus } from '../modules/lineReviews/types';
import useLineReview from '../modules/lineReviews/useLineReview';
import delayMs from '../utils/delayMs';

import { LoaderContainer } from './elements';
import { PagePath } from './Menubar';

const SIDE_PANEL_RIGHT_WIDTH = 450;
export const DISCREPANCY_MODAL_OFFSET_X = 50;
export const DISCREPANCY_MODAL_OFFSET_Y = -50;

const StyledContainer = styled.div`
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

export const MainContainer = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

export type DiscrepancyModalState = {
  isOpen: boolean;
  discrepancyId: string | undefined;
  position: {
    x: number;
    y: number;
  };
};

const LineReview = () => {
  const { id, unit } = useParams<{ id: string; unit: string }>();
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const history = useHistory();
  const [isReportBackModalOpen, setIsReportBackModalOpen] = useState(false);
  const [ornateRef, setOrnateRef] = useState<CogniteOrnate | undefined>(
    undefined
  );
  const [discrepancyModalState, setDiscrepancyModalState] =
    useState<DiscrepancyModalState>({
      isOpen: false,
      discrepancyId: undefined,
      position: {
        x: 0,
        y: 0,
      },
    });

  const { client } = useAuthContext();
  const {
    isLoading,
    lineReview,
    documents,
    discrepancies,
    setDiscrepancies,
    textAnnotations,
    setDocuments,
  } = useLineReview(client, id, unit);

  if (isLoading || !client) {
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

    if (ornateRef === undefined) {
      return;
    }

    if (client === undefined) {
      return;
    }

    await updateLineReview(client, lineReview.id, lineReview.unit, {
      status: LineReviewStatus.COMPLETED,
      comment,
      state: getExportableLineState(ornateRef, discrepancies),
    });

    // This is a workaround to ensure that the data is updated before
    // we fetch it anew.
    await delayMs(1000);

    history.push(PagePath.LINE_REVIEWS);
  };

  const onDiscrepancyInteraction: DiscrepancyInteractionHandler = (
    ornateRef: CogniteOrnate | undefined,
    nodeId: string
  ) => {
    if (ornateRef === undefined) {
      console.log('onDiscrepancyInteraction: ornateRef is undefined');
      return;
    }

    const { x: containerX, y: containerY } =
      ornateRef.host.getBoundingClientRect();

    const node = ornateRef?.stage.findOne(`#${nodeId}`) as Konva.Rect;

    if (node === undefined) {
      console.error('onDiscrepancyInteraction: node is undefined');
      return;
    }

    const { x, y, width, height } = node.getClientRect({
      skipStroke: true,
    });

    const foundDiscrepancyIndex = discrepancies.findIndex((discrepancy) =>
      discrepancy.annotations.some((annotation) => annotation.nodeId === nodeId)
    );

    if (foundDiscrepancyIndex === -1) {
      console.error('onDiscrepancyInteraction: discrepancy not found');
      return;
    }

    const foundDiscrepancy = discrepancies[foundDiscrepancyIndex];

    setDiscrepancyModalState((prevState) => ({
      ...prevState,
      discrepancyId: foundDiscrepancy.id,
      position: {
        x: containerX + x + width + DISCREPANCY_MODAL_OFFSET_X,
        y: containerY + y + height + DISCREPANCY_MODAL_OFFSET_Y,
      },
      isOpen: true,
    }));
  };

  const zoomToDiscrepancy = (discrepancyId: string) => {
    const nodeId = discrepancies.find(
      (discrepancy) => discrepancy.id === discrepancyId
    )?.annotations[0].nodeId;

    const node = ornateRef?.stage.findOne(`#${nodeId}`) as Konva.Rect;
    if (node === undefined) {
      console.error('onDiscrepancyEditPress: node is undefined');
      return;
    }

    if (ornateRef === undefined) {
      console.error('onDiscrepancyEditPress: ornateRef is undefined');
      return;
    }

    const boundingBox = node.getClientRect({
      relativeTo: ornateRef?.stage,
      skipStroke: true,
    });

    const PADDING_FACTOR = 1.3;
    const scale = clamp(
      Math.min(
        ornateRef.stage.width() / (boundingBox.width * PADDING_FACTOR),
        ornateRef.stage.height() / (boundingBox.height * PADDING_FACTOR)
      ),
      0.5,
      2
    );

    ornateRef?.zoomToLocation(
      {
        x: -(boundingBox.x + boundingBox.width / 2),
        y: -(boundingBox.y + boundingBox.height / 2),
      },
      scale
    );
  };

  const onDiscrepancyPress = (discrepancyId: string) =>
    zoomToDiscrepancy(discrepancyId);

  const onDiscrepancyEditPress = (discrepancyId: string) => {
    zoomToDiscrepancy(discrepancyId);
    setTimeout(() => {
      const nodeId = discrepancies.find(
        (discrepancy) => discrepancy.id === discrepancyId
      )?.annotations[0].nodeId;

      if (nodeId === undefined) {
        return;
      }
      onDiscrepancyInteraction(ornateRef, nodeId);
    }, 500);
  };

  const onDeleteDiscrepancy = (discrepancyId: string) => {
    setDiscrepancyModalState((prevState) => ({ ...prevState, isOpen: false }));
    return setDiscrepancies((discrepancies) =>
      discrepancies.filter((discrepancy) => discrepancy.id !== discrepancyId)
    );
  };

  return (
    <StyledContainer>
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
            ? exportDocumentsToPdf(
                ornateRef,
                documents,
                discrepancies,
                `line-review-${lineReview.id}.pdf`
              )
            : undefined
        }
        onReportBackPress={onReportBackPress}
      />
      <CollapsablePanel
        sidePanelRight={
          <SidePanel
            documents={documents}
            discrepancies={discrepancies.filter(
              (discrepancy) => discrepancy.status === 'approved'
            )}
            onClosePress={() => setIsSidePanelOpen(false)}
            onDiscrepancyPress={onDiscrepancyPress}
            onDiscrepancyEditPress={onDiscrepancyEditPress}
            onDiscrepancyDeletePress={(id) => onDeleteDiscrepancy(id)}
          />
        }
        sidePanelRightVisible={isSidePanelOpen}
        sidePanelRightWidth={SIDE_PANEL_RIGHT_WIDTH}
      >
        <MainContainer>
          <LineReviewViewer
            lineReview={lineReview}
            discrepancies={discrepancies}
            onDiscrepancyChange={setDiscrepancies}
            textAnnotations={textAnnotations}
            documents={documents}
            setDocuments={setDocuments}
            onOrnateRef={setOrnateRef}
            onOpenSidePanelButtonPress={() => setIsSidePanelOpen(true)}
            onDeleteDiscrepancy={onDeleteDiscrepancy}
            discrepancyModalState={discrepancyModalState}
            setDiscrepancyModalState={setDiscrepancyModalState}
            onDiscrepancyInteraction={onDiscrepancyInteraction}
            isSidePanelOpen={isSidePanelOpen}
          />
        </MainContainer>
      </CollapsablePanel>
    </StyledContainer>
  );
};

export default LineReview;
