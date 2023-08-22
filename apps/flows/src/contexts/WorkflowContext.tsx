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
import { ChangeOptions } from '@automerge/automerge';
import { useUpdateFlow } from '@flows/hooks/files';
import { AFlow, CanvasEdges, CanvasNodes } from '@flows/types';
import { WorkflowExecution } from '@flows/types/workflows';
import { useUserInfo } from '@flows/utils/user';
import { debounce, isEqual } from 'lodash';
import { v4 } from 'uuid';

type Logger = (oldDoc: AFlow) => ChangeOptions<AFlow> | undefined;
type FlowContextT = {
  externalId: string;
  isComponentsPanelVisible: boolean;
  setIsComponentsPanelVisible: Dispatch<SetStateAction<boolean>>;
  focusedProcessNodeId?: string;
  setFocusedProcessNodeId: Dispatch<SetStateAction<string | undefined>>;
  changeFlow: (fn: Automerge.ChangeFn<AFlow>, logger?: Logger) => void;
  flow: AFlow;
  flowRef: MutableRefObject<AFlow>;
  changeNodes: (fn: AutomergeChangeNodesFn, logger?: Logger) => void;
  changeEdges: (fn: AutomergeChangeEdgesFn, logger?: Logger) => void;
  restoreWorkflow: (heads: Automerge.Heads) => void;
  nodes: CanvasNodes;
  edges: CanvasEdges;
  isHistoryVisible: boolean;
  setHistoryVisible: Dispatch<SetStateAction<boolean>>;
  previewHash?: string;
  setPreviewHash: Dispatch<SetStateAction<string | undefined>>;
  userState: UserState;
  setUserState: Dispatch<SetStateAction<UserState>>;
  otherUserStates: UserState[];
  setOtherUserStates: Dispatch<SetStateAction<UserState[]>>;
  activeViewMode: ViewMode;
  setActiveViewMode: Dispatch<SetStateAction<ViewMode>>;
  selectedExecution?: WorkflowExecution;
  setSelectedExecution: Dispatch<SetStateAction<WorkflowExecution | undefined>>;
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

const CONNECTION_ID = v4();

export type UserState = {
  connectionId: string;
  name?: string;
  selectedObjectIds: string[];
};

export type ViewMode = 'edit' | 'run-history';

export const FlowContextProvider = ({
  externalId,
  children,
  initialFlow,
}: FlowContextProviderProps) => {
  const [isComponentsPanelVisible, setIsComponentsPanelVisible] =
    useState(false);
  const [isHistoryVisible, setHistoryVisible] = useState(false);
  const [previewHash, setPreviewHash] = useState<string | undefined>();
  const [flowState, setFlowState] = useState(initialFlow);
  const flowRef = useRef(initialFlow);

  const [activeViewMode, setActiveViewMode] = useState<ViewMode>('edit');

  const [focusedProcessNodeId, setFocusedProcessNodeId] = useState<
    string | undefined
  >(undefined);

  const [selectedExecution, setSelectedExecution] = useState<
    WorkflowExecution | undefined
  >(undefined);

  const { data: userInfo } = useUserInfo();
  const { mutate: updateFlow } = useUpdateFlow();

  const externalFlowRef = useRef(initialFlow);

  const [userState, setUserState] = useState<UserState>({
    connectionId: CONNECTION_ID,
    selectedObjectIds: [],
  });

  const [otherUserStates, setOtherUserStates] = useState<UserState[]>([]);

  const debouncedMutate = useMemo(() => {
    const mutate = (newFlow: AFlow) => {
      externalFlowRef.current = newFlow;
      updateFlow(newFlow);
    };

    return debounce(mutate, 500);
  }, [updateFlow]);

  useEffect(() => {
    setUserState((prevState) => ({
      ...prevState,
      name: userInfo?.displayName,
    }));
  }, [userInfo]);

  const changeFlow = useCallback(
    (fn: Automerge.ChangeFn<AFlow>, logger?: Logger) => {
      const msg = logger ? logger(flowRef.current) : undefined;
      let newFlow = msg
        ? Automerge.change(flowRef.current, msg, fn)
        : Automerge.change(flowRef.current, fn);
      let anythingChanged = !isEqual(
        Automerge.getHeads(flowRef.current),
        Automerge.getHeads(newFlow)
      );

      if (msg && !anythingChanged) {
        newFlow = Automerge.emptyChange(flowRef.current, msg);
        anythingChanged = true;
      }
      flowRef.current = newFlow;
      // `fn` could end up doing no changes. Since there are no actual changes, there is no point in
      // updating state or persisting the doc. In the current version of AM it also seems safe to
      // only update the ref if a change is detected, but I'm not sure if that will always be true
      // (`AM.change(doc, noop); AM.change(doc, noop);` could possibly lead to an "Atempting to
      // change an outdated document." error). Updating the ref shouldn't have any significant cost.
      if (anythingChanged) {
        setFlowState(newFlow);
        debouncedMutate(newFlow);
      }
    },
    [debouncedMutate]
  );

  const restoreWorkflow = useCallback(
    (heads: Automerge.Heads) => {
      const oldRev = Automerge.view(flowRef.current, heads);
      const newFlow = Automerge.change(
        flowRef.current,
        {
          time: Date.now(),
          message: JSON.stringify({
            message: `Restore previus version`,
            user: userInfo?.displayName,
          }),
        },

        (d) => {
          d.canvas = JSON.parse(JSON.stringify(oldRev.canvas));
        }
      );
      flowRef.current = newFlow;
      setFlowState(newFlow);
      debouncedMutate(newFlow);
    },
    [debouncedMutate, userInfo?.displayName]
  );

  const changeNodes = useCallback(
    (fn: AutomergeChangeNodesFn, logger?: Logger) => {
      changeFlow((f) => {
        fn(f.canvas.nodes);
      }, logger);
    },
    [changeFlow]
  );

  const flow = useMemo(() => {
    if (previewHash) {
      return Automerge.view(flowState, [previewHash]);
    }
    return flowState;
  }, [flowState, previewHash]);

  const changeEdges = useCallback(
    (fn: AutomergeChangeEdgesFn, logger?: Logger) => {
      changeFlow((f) => {
        fn(f.canvas.edges);
      }, logger);
    },
    [changeFlow]
  );

  useEffect(() => {
    if (!isHistoryVisible) {
      setPreviewHash(undefined);
    }
  }, [isHistoryVisible]);

  return (
    <WorkflowContext.Provider
      value={{
        externalId,
        isComponentsPanelVisible,
        setIsComponentsPanelVisible,
        flow,
        flowRef,
        changeFlow,
        changeNodes,
        changeEdges,
        nodes: flowState.canvas.nodes,
        edges: flowState.canvas.edges,
        isHistoryVisible,
        setHistoryVisible,
        previewHash,
        setPreviewHash,
        restoreWorkflow,
        userState,
        setUserState,
        otherUserStates,
        setOtherUserStates,
        focusedProcessNodeId,
        setFocusedProcessNodeId,
        activeViewMode,
        setActiveViewMode,
        selectedExecution,
        setSelectedExecution,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
};
