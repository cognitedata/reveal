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
import { Discrepancy } from '../components/LineReviewViewer/LineReviewViewer';
import ReportBackModal from '../components/ReportBackModal';
import {
  saveLineReviewState,
  updateLineReviews,
} from '../modules/lineReviews/api';
import getExportableLineState from '../modules/lineReviews/getExportableLineState';
import { LineReviewStatus } from '../modules/lineReviews/types';
import useLineReview from '../modules/lineReviews/useLineReview';

import { LoaderContainer } from './elements';
import { PagePath } from './Menubar';

const SIDE_PANEL_RIGHT_WIDTH = 450;
const DISCREPANCY_MODAL_OFFSET_X = 50;
const DISCREPANCY_MODAL_OFFSET_Y = -50;

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
  discrepancy: Discrepancy | undefined;
  position: {
    x: number;
    y: number;
  };
};

const LineReview = () => {
  const { id } = useParams<{ id: string }>();
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const history = useHistory();
  const [isReportBackModalOpen, setIsReportBackModalOpen] = useState(false);
  const [ornateRef, setOrnateRef] = useState<CogniteOrnate | undefined>(
    undefined
  );
  const [discrepancyModalState, setDiscrepancyModalState] =
    useState<DiscrepancyModalState>({
      isOpen: false,
      discrepancy: undefined,
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
    setTextAnnotations,
  } = useLineReview(id);

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

    await saveLineReviewState(
      client,
      lineReview,
      getExportableLineState(ornateRef, discrepancies)
    );

    await updateLineReviews(client, {
      ...lineReview,
      comment,
      status: LineReviewStatus.COMPLETED,
    });
    history.push(PagePath.LINE_REVIEWS);
  };

  const onDiscrepancyInteraction = (id: string) => {
    const node = ornateRef?.stage.findOne(`#${id}`) as Konva.Rect;

    if (node === undefined) {
      console.error('onDiscrepancyInteraction: node is undefined');
      return;
    }

    const { x, y, width, height } = node.getClientRect({
      skipStroke: true,
    });

    const foundDiscrepancy = discrepancies.find(
      (discrepancy) => discrepancy.id === id
    );

    if (!foundDiscrepancy) {
      console.error('onDiscrepancyInteraction: discrepancy not found');
      return;
    }

    setDiscrepancyModalState((prevState) => ({
      ...prevState,
      discrepancy: foundDiscrepancy,
      position: {
        x: x + width + DISCREPANCY_MODAL_OFFSET_X,
        y: y + height + DISCREPANCY_MODAL_OFFSET_Y,
      },
      isOpen: true,
    }));
  };

  const zoomToDiscrepancy = (id: string) => {
    const node = ornateRef?.stage.findOne(`#${id}`) as Konva.Rect;
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

  const onDiscrepancyPress = (id: string) => zoomToDiscrepancy(id);

  const onDiscrepancyEditPress = (id: string) => {
    zoomToDiscrepancy(id);
    setTimeout(() => {
      onDiscrepancyInteraction(id);
    }, 500);
  };

  const onDeleteDiscrepancy = (id: string) => {
    setDiscrepancyModalState((prevState) => ({ ...prevState, isOpen: false }));
    return setDiscrepancies((discrepancies) =>
      discrepancies.filter((discrepancy) => discrepancy.id !== id)
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
            ornateRef={ornateRef}
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
            client={client}
            lineReview={lineReview}
            discrepancies={discrepancies}
            onDiscrepancyChange={setDiscrepancies}
            textAnnotations={textAnnotations}
            onTextAnnotationChange={setTextAnnotations}
            documents={documents}
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
