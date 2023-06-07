import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { FileInfo } from '@cognite/sdk';
import { useCdfItems } from '@cognite/sdk-react-query-hooks';
import { Colors, Title, Tooltip } from '@cognite/cogs.js';
import { diagramPreview } from 'routes/paths';
import { PNID_METRICS, trackUsage } from 'utils/Metrics';
import { getUrlWithQueryParams } from 'utils/config';
import { ModalSaveSVG } from 'containers';
import { Flex, MenuButton } from 'components/Common';
import { useReviewFiles, useConvertToSVG, isFilePending } from 'hooks';
import { useWorkflowCreateNew } from 'modules/workflows';

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
  const history = useHistory();
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
    history.push(
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
          color: Colors.white.hex(),
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
            <MenuButton
              type={primarySetting === 'reject' ? 'danger' : 'ghost-danger'}
              variant={
                primarySetting === 'reject' || isApproveDisabled
                  ? 'default'
                  : 'inverted'
              }
              onClick={() => onRejectDiagrams()}
              disabled={isApproveDisabled}
              style={{ color: Colors['red-5'].hex() }}
            >
              Reject selected tags
            </MenuButton>
          </Tooltip>
        )}
        {settingButtons?.approve && (
          <Tooltip
            disabled={!isApproveDisabled}
            content="All of the selected diagrams are already approved or have no tags to approve."
          >
            <MenuButton
              type={primarySetting === 'approve' ? 'tertiary' : 'ghost'}
              variant={
                primarySetting === 'approve' || isApproveDisabled
                  ? 'default'
                  : 'inverted'
              }
              onClick={() => onApproveDiagrams()}
              disabled={isApproveDisabled}
            >
              Approve selected tags
            </MenuButton>
          </Tooltip>
        )}
        {settingButtons?.preview && (
          <MenuButton
            type={primarySetting === 'preview' ? 'tertiary' : 'ghost'}
            variant={primarySetting === 'preview' ? 'default' : 'inverted'}
            onClick={onPreviewSelectedClick}
          >
            Preview selected
          </MenuButton>
        )}
        {settingButtons?.svgSave && (
          <MenuButton
            type={primarySetting === 'svgSave' ? 'tertiary' : 'ghost'}
            variant={primarySetting === 'svgSave' ? 'default' : 'inverted'}
            icon={isConverting ? 'Loader' : undefined}
            disabled={isConverting}
            onClick={onSaveSVGClick}
          >
            Save as SVG
          </MenuButton>
        )}
        {settingButtons?.recontextualize && (
          <MenuButton
            type={primarySetting === 'recontextualize' ? 'tertiary' : 'ghost'}
            variant={
              primarySetting === 'recontextualize' ? 'default' : 'inverted'
            }
            disabled={isConverting}
            onClick={onRecontextualize}
          >
            Recontextualize
          </MenuButton>
        )}
        <MenuButton
          type="secondary"
          icon="CloseLarge"
          variant="inverted"
          onClick={onClose}
        />
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
  background-color: ${Colors['greyscale-grey10'].hex()};
`;
const Buttons = styled(Flex)`
  & > * {
    margin-right: 8px;
  }
`;
