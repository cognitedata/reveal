import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import styled from 'styled-components';

import { Button, Colors, Title, Tooltip } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';
import { useCdfItems } from '@cognite/sdk-react-query-hooks';

import { Flex } from '../components/Common';
import { useReviewFiles, useConvertToSVG, isFilePending } from '../hooks';
import { useWorkflowCreateNew } from '../modules/workflows';
import { diagramPreview } from '../routes/paths';
import { getUrlWithQueryParams } from '../utils/config';
import { PNID_METRICS, trackUsage } from '../utils/Metrics';

import { ModalSaveSVG } from './';

type Button = 'reject' | 'approve' | 'svgSave' | 'recontextualize' | 'preview';
type Props = {
  selectedDiagramsIds: number[];
  buttons?: Button[];
  primarySetting?: Button;
  marginBottom?: number;
  onClose: () => void;
};

export const DiagramsSettingsBar = (props: Props) => {
  const {
    selectedDiagramsIds,
    buttons = [],
    primarySetting = 'svgSave',
    marginBottom = 64,
    onClose,
  } = props;
  const navigate = useNavigate();
  const { createWorkflow } = useWorkflowCreateNew();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isApproveDisabled, setIsApproveDisabled] = useState<boolean>(true);

  const { data: allDiagrams = [] } = useCdfItems<FileInfo>(
    'files',
    selectedDiagramsIds.map((id) => ({ id })),
    true
  );

  const { workflowId } = useParams<{ workflowId: string }>();
  const { isConverting } = useConvertToSVG(selectedDiagramsIds);
  const {
    onApproveDiagrams,
    onRejectDiagrams,
    isOnApprovedSuccess,
    isOnRejectedSuccess,
  } = useReviewFiles(selectedDiagramsIds);

  const onPreviewSelectedClick = () => {
    navigate(
      getUrlWithQueryParams(
        diagramPreview.path(workflowId, selectedDiagramsIds[0])
      )
    );
  };
  const onSaveSVGClick = () => setShowModal(true);
  const onRecontextualize = () => {
    const diagramsToRecontextualize = {
      type: 'files',
      endpoint: 'retrieve',
      filter: selectedDiagramsIds.map((id: number) => ({ id })),
    };
    trackUsage(PNID_METRICS.landingPage.editFile, {
      fileId: selectedDiagramsIds,
    });
    createWorkflow({ diagrams: diagramsToRecontextualize });
  };

  const settingButtons: { [key in Button]?: boolean } = Object.fromEntries(
    buttons.map((b: Button) => [b, true])
  );

  useEffect(() => {
    const pendingDiagrams = selectedDiagramsIds.filter((id: number) => {
      const diagram = allDiagrams?.find((d) => d.id === id);
      return diagram ? isFilePending(diagram) : false;
    });
    if (pendingDiagrams.length) {
      setIsApproveDisabled(false);
    } else setIsApproveDisabled(true);
  }, [allDiagrams, selectedDiagramsIds]);

  useEffect(() => {
    if (isOnApprovedSuccess || isOnRejectedSuccess) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnApprovedSuccess, isOnRejectedSuccess]);

  return (
    <Bar marginBottom={marginBottom}>
      <Title
        level={6}
        style={{
          margin: '0 8px',
          color: Colors['decorative--grayscale--white'],
        }}
      >
        {selectedDiagramsIds.length} diagrams selected
      </Title>
      <Buttons row>
        {settingButtons?.reject && (
          <Tooltip
            disabled={!isApproveDisabled}
            content="All of the selected diagrams are already approved or have no tags to reject."
          >
            <Button
              type={
                primarySetting === 'reject'
                  ? 'destructive'
                  : 'ghost-destructive'
              }
              inverted={primarySetting !== 'reject' && !isApproveDisabled}
              onClick={() => onRejectDiagrams()}
              disabled={isApproveDisabled}
            >
              Reject selected tags
            </Button>
          </Tooltip>
        )}
        {settingButtons?.approve && (
          <Tooltip
            disabled={!isApproveDisabled}
            content="All of the selected diagrams are already approved or have no tags to approve."
          >
            <Button
              type={primarySetting === 'approve' ? 'tertiary' : 'ghost'}
              inverted={primarySetting !== 'approve' && !isApproveDisabled}
              onClick={() => onApproveDiagrams()}
              disabled={isApproveDisabled}
            >
              Approve selected tags
            </Button>
          </Tooltip>
        )}
        {settingButtons?.preview && (
          <Button
            type={primarySetting === 'preview' ? 'tertiary' : 'ghost'}
            inverted={primarySetting !== 'preview'}
            onClick={onPreviewSelectedClick}
          >
            Preview selected
          </Button>
        )}
        {settingButtons?.svgSave && (
          <Button
            type={primarySetting === 'svgSave' ? 'tertiary' : 'ghost'}
            inverted={primarySetting !== 'svgSave'}
            icon={isConverting ? 'Loader' : undefined}
            disabled={isConverting}
            onClick={onSaveSVGClick}
          >
            Save as SVG
          </Button>
        )}
        {settingButtons?.recontextualize && (
          <Button
            type={primarySetting === 'recontextualize' ? 'tertiary' : 'ghost'}
            inverted={primarySetting !== 'recontextualize'}
            disabled={isConverting}
            onClick={onRecontextualize}
          >
            Recontextualize
          </Button>
        )}
        <Button type="secondary" icon="CloseLarge" inverted onClick={onClose} />
        <ModalSaveSVG
          diagramIds={selectedDiagramsIds}
          showModal={showModal}
          setShowModal={setShowModal}
        />
      </Buttons>
    </Bar>
  );
};

const Bar = styled.div<{ marginBottom: number }>`
  display: flex;
  position: sticky;
  bottom: ${(props) => props.marginBottom}px;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 52px;
  border-radius: 8px;
  margin-top: 8px;
  background-color: ${Colors['decorative--grayscale--1000']};
`;
const Buttons = styled(Flex)`
  & > * {
    margin-right: 8px;
  }
`;
