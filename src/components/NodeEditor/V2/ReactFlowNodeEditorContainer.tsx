import { Button } from '@cognite/cogs.js';
import { chartAtom } from 'models/chart/atom';
import { FlowExportObject, ReactFlowProvider } from 'react-flow-renderer';
import { useRecoilState } from 'recoil';
import {
  ChartTimeSeries,
  ChartWorkflow,
  ChartWorkflowV2,
} from 'models/chart/types';
import { updateWorkflow } from 'models/chart/updates';
import { trackUsage } from 'services/metrics';
import styled from 'styled-components/macro';
import Layers from 'utils/z-index';
import ReactFlowNodeEditor from './ReactFlowNodeEditor';
import { useAvailableOps } from '../AvailableOps';

type NodeEditorProps = {
  workflow: ChartWorkflowV2;
  sources: (ChartTimeSeries | ChartWorkflow)[];
  closeNodeEditor: () => void;
};

const ReactFlowNodeEditorContainer = ({
  workflow,
  sources,
  closeNodeEditor,
}: NodeEditorProps) => {
  const [, setChart] = useRecoilState(chartAtom);
  const operations = useAvailableOps();

  const saveOutputName = (newCalculationName: string) => {
    setChart((oldChart) =>
      updateWorkflow(oldChart!, workflow?.id, {
        name: newCalculationName,
      })
    );
  };

  const saveFlow = (flow: FlowExportObject) => {
    setChart((oldChart) => updateWorkflow(oldChart!, workflow?.id, { flow }));
  };

  const getSavedFlow = () => {
    return workflow?.flow;
  };

  const handleEditorClick = () => {
    trackUsage('NodeEditor.Click', { editor: 'React Flow' });
  };

  return (
    <ReactFlowProvider>
      <ReactFlowNodeEditor
        sources={sources}
        operations={operations}
        output={{
          id: workflow?.id,
          name: workflow?.name,
          color: workflow?.color,
        }}
        getSavedFlow={getSavedFlow}
        saveFlow={saveFlow}
        saveOutputName={saveOutputName}
        onEditorClick={handleEditorClick}
      />
      <CloseButton
        icon="Close"
        type="ghost"
        onClick={() => {
          closeNodeEditor();
        }}
        aria-label="Close"
      />
    </ReactFlowProvider>
  );
};

const CloseButton = styled(Button)`
  position: absolute;
  top: 0;
  right: 0;
  z-index: ${Layers.MINIMUM};
`;

export default ReactFlowNodeEditorContainer;
