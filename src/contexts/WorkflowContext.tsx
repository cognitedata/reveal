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

  selectedNodeId: CanvasNode['id'];
  setSelectedNodeId: Dispatch<SetStateAction<CanvasNode['id']>>;
  selectedNodeComponent: ProcessType;
  setSelectedNodeComponent: Dispatch<SetStateAction<ProcessType>>;
  selectedNodeDescription: string;
  setSelectedNodeDescription: Dispatch<SetStateAction<string>>;
  selectedNodeItem: string;
  setSelectedNodeItem: Dispatch<SetStateAction<string>>;
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
  const [flowState, setFlowState] = useState(initialFlow);
  const flowRef = useRef(initialFlow);
  const [isNodeConfigurationPanelOpen, setIsNodeConfigurationPanelOpen] =
    useState(() => {
      const nodesSelected = initialFlow.canvas.nodes.filter((node) => {
        return node.selected;
      });
      const initialIsNodeConfigurationPanelOpen =
        nodesSelected.length > 0 ? true : false;
      return initialIsNodeConfigurationPanelOpen;
    });

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

  const [selectedNodeId, setSelectedNodeId] = useState(
    initialFlow.canvas.nodes[0].id
  );
  const [selectedNodeComponent, setSelectedNodeComponent] = useState(() => {
    const nodeData = initialFlow.canvas.nodes[0].data as ProcessNodeData;
    return nodeData.processType;
  });
  const [selectedNodeDescription, setSelectedNodeDescription] = useState(() => {
    const nodeData = initialFlow.canvas.nodes[0].data as ProcessNodeData;
    return nodeData.processDescription as string;
  });
  const [selectedNodeItem, setSelectedNodeItem] = useState(() => {
    const nodeData = initialFlow.canvas.nodes[0].data as ProcessNodeData;
    return nodeData.processItem as string;
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
        selectedNodeId,
        setSelectedNodeId,
        selectedNodeComponent,
        setSelectedNodeComponent,
        selectedNodeDescription,
        setSelectedNodeDescription,
        selectedNodeItem,
        setSelectedNodeItem,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
};
