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
import { AFlow, CanvasEdges, CanvasNodes } from 'types';
import { ChangeOptions } from '@automerge/automerge';

type FlowContextT = {
  externalId: string;
  isComponentsPanelVisible: boolean;
  setIsComponentsPanelVisible: Dispatch<SetStateAction<boolean>>;
  changeFlow: (
    fn: Automerge.ChangeFn<AFlow>,
    logger?: () => ChangeOptions<AFlow> | string | undefined
  ) => void;
  flow: AFlow;
  flowRef: MutableRefObject<AFlow>;
  changeNodes: (fn: AutomergeChangeNodesFn) => void;
  changeEdges: (fn: AutomergeChangeEdgesFn) => void;
  nodes: CanvasNodes;
  edges: CanvasEdges;
  isHistoryVisible: boolean;
  setHistoryVisible: Dispatch<SetStateAction<boolean>>;
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
  const [isHistoryVisible, setHistoryVisible] = useState(false);
  const [flowState, setFlowState] = useState(initialFlow);
  const flowRef = useRef(initialFlow);

  const { mutate } = useUpdateFlow();
  const debouncedMutate = useMemo(() => debounce(mutate, 500), [mutate]);

  const changeFlow = useCallback(
    (
      fn: Automerge.ChangeFn<AFlow>,
      logger?: () => ChangeOptions<AFlow> | string | undefined
    ) => {
      const msg = logger ? logger() : undefined;
      const newFlow = msg
        ? Automerge.change(flowRef.current, msg, fn)
        : Automerge.change(flowRef.current, fn);
      flowRef.current = newFlow;
      setFlowState(newFlow);
      debouncedMutate(newFlow);
    },
    [debouncedMutate]
  );

  const history = useMemo(
    () =>
      Automerge.getHistory(flowState)
        .filter((h) => !!h.change.message)
        .map((h) => ({ message: h.change.message, time: h.change.time })),
    [flowState]
  );

  useEffect(() => console.log(history), [history]);

  const changeNodes = useCallback(
    (
      fn: AutomergeChangeNodesFn,
      logger?: () => ChangeOptions<AFlow> | string | undefined
    ) => {
      changeFlow((f) => {
        fn(f.canvas.nodes);
      }, logger);
    },
    [changeFlow]
  );

  const changeEdges = useCallback(
    (fn: AutomergeChangeEdgesFn, logger?: () => ChangeOptions<AFlow>) => {
      changeFlow((f) => {
        fn(f.canvas.edges);
      }, logger);
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

  return (
    <WorkflowContext.Provider
      value={{
        externalId,
        isComponentsPanelVisible,
        setIsComponentsPanelVisible,
        flow: flowState,
        flowRef,
        changeFlow,
        changeNodes,
        changeEdges,
        nodes: flowState.canvas.nodes,
        edges: flowState.canvas.edges,
        isHistoryVisible,
        setHistoryVisible,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
};
