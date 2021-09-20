import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { FileInfo } from '@cognite/sdk';
import { useCdfItems } from '@cognite/sdk-react-query-hooks';
import { Colors, Title, Tooltip } from '@cognite/cogs.js';
import { diagramPreview } from 'routes/paths';
import { PNID_METRICS, trackUsage } from 'utils/Metrics';
import { ModalSaveSVG } from 'containers';
import { Flex, MenuButton } from 'components/Common';
import { useReviewFiles, useConvertToSVG, isFilePending } from 'hooks';
import { useWorkflowCreateNew } from 'modules/workflows';
import { selectDiagrams } from 'modules/contextualization/pnidParsing';

type Button = 'reject' | 'approve' | 'svgSave' | 'recontextualize' | 'preview';
type Props = {
  selectedDiagramsIds: number[];
  buttons?: Button[];
  primarySetting?: Button;
};

export const DiagramsSettingsBar = (props: Props) => {
  const {
    selectedDiagramsIds,
    buttons = [],
    primarySetting = 'svgSave',
  } = props;
  const dispatch = useDispatch();
  const history = useHistory();
  const { createWorkflow } = useWorkflowCreateNew();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isApproveDisabled, setIsApproveDisabled] = useState<boolean>(true);

  const { data: allDiagrams = [] } = useCdfItems<FileInfo>(
    'files',
    selectedDiagramsIds.map((id) => ({ id })),
    true
  );

  const { tenant, workflowId } =
    useParams<{ tenant: string; workflowId: string }>();
  const { isConverting } = useConvertToSVG(selectedDiagramsIds);
  const { onApproveDiagrams, onRejectDiagrams } =
    useReviewFiles(selectedDiagramsIds);

  const onCancelClick = () => {
    dispatch(selectDiagrams({ workflowId, diagramIds: [] }));
  };
  const onPreviewSelectedClick = () => {
    history.push(
      diagramPreview.path(tenant, workflowId, selectedDiagramsIds[0])
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

  return (
    <Bar row align>
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
            icon={isConverting ? 'LoadingSpinner' : undefined}
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
          icon="XLarge"
          variant="inverted"
          onClick={onCancelClick}
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

const Bar = styled(Flex)`
  position: sticky;
  bottom: 64px;
  justify-content: space-between;
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
