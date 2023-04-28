import {
  useState,
  createContext,
  ReactNode,
  Dispatch,
  SetStateAction,
  useContext,
  MutableRefObject,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from 'react';

import * as Automerge from '@automerge/automerge';
import { debounce } from 'lodash';

import { useFlow, useUpdateFlow } from 'hooks/files';
import {
  AFlow,
  CanvasEdges,
  CanvasNodes,
  CanvasNode,
  ProcessType,
  ProcessNodeData,
} from 'types';

type FlowContextT = {
  externalId: string;
  isComponentsPanelVisible: boolean;
  setIsComponentsPanelVisible: Dispatch<SetStateAction<boolean>>;
  isNodeConfigurationPanelOpen: boolean;
  setIsNodeConfigurationPanelOpen: Dispatch<SetStateAction<boolean>>;
  changeFlow: (fn: Automerge.ChangeFn<AFlow>) => void;
  flow: AFlow;
  flowRef: MutableRefObject<AFlow>;

  changeNodes: (fn: AutomergeChangeNodesFn) => void;
  changeEdges: (fn: AutomergeChangeEdgesFn) => void;
  nodes: CanvasNodes;
  edges: CanvasEdges;

  selectedNode: CanvasNode;
  setSelectedNode: Dispatch<SetStateAction<CanvasNode>>;
  selectedNodeComponent: ProcessType;
  setSelectedNodeComponent: Dispatch<SetStateAction<ProcessType>>;
};
export const WorkflowContext = createContext<FlowContextT>(undefined!);

export const useWorkflowBuilderContext = () => useContext(WorkflowContext);

type FlowContextProviderProps = {
  externalId: string;
  children: ReactNode;
  initialFlow: AFlow;
};

type AutomergeChangeNodesFn = Automerge.ChangeFn<CanvasNodes>;
type AutomergeChangeEdgesFn = Automerge.ChangeFn<CanvasEdges>;

export const FlowContextProvider = ({
  externalId,
  children,
  initialFlow,
}: FlowContextProviderProps) => {
  const [isComponentsPanelVisible, setIsComponentsPanelVisible] =
    useState(false);
  const [isNodeConfigurationPanelOpen, setIsNodeConfigurationPanelOpen] =
    useState(false);
  const [flowState, setFlowState] = useState(initialFlow);
  const flowRef = useRef(initialFlow);

  const { mutate } = useUpdateFlow();
  const debouncedMutate = useMemo(() => debounce(mutate, 500), [mutate]);

  const changeFlow = useCallback(
    (fn: Automerge.ChangeFn<AFlow>) => {
      const newFlow = Automerge.change(flowRef.current, fn);
      flowRef.current = newFlow;
      setFlowState(newFlow);
      debouncedMutate(newFlow);
    },
    [debouncedMutate]
  );

  const changeNodes = useCallback(
    (fn: AutomergeChangeNodesFn) => {
      changeFlow((f) => {
        fn(f.canvas.nodes);
      });
    },
    [changeFlow]
  );

  const changeEdges = useCallback(
    (fn: AutomergeChangeEdgesFn) => {
      changeFlow((f) => {
        fn(f.canvas.edges);
      });
    },
    [changeFlow]
  );

  const { data } = useFlow(externalId, {
    staleTime: 0,
    refetchInterval: 1000,
  });

  useEffect(() => {
    if (data) {
      flowRef.current = data;
      setFlowState(data);
    }
  }, [data]);

  const [selectedNode, setSelectedNode] = useState(initialFlow.canvas.nodes[0]);
  const [selectedNodeComponent, setSelectedNodeComponent] = useState(() => {
    const nodeData = initialFlow.canvas.nodes[0].data as ProcessNodeData;
    return nodeData.processType;
  });

  return (
    <WorkflowContext.Provider
      value={{
        externalId,
        isComponentsPanelVisible,
        setIsComponentsPanelVisible,
        isNodeConfigurationPanelOpen,
        setIsNodeConfigurationPanelOpen,
        flow: flowState,
        flowRef,
        changeFlow,
        changeNodes,
        changeEdges,
        nodes: flowState.canvas.nodes,
        edges: flowState.canvas.edges,
        selectedNode,
        setSelectedNode,
        selectedNodeComponent,
        setSelectedNodeComponent,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
};
