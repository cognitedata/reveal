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
import { debounce, isEqual } from 'lodash';

import { useUpdateFlow } from 'hooks/files';
import { AFlow, CanvasEdges, CanvasNodes } from 'types';
import { ChangeOptions } from '@automerge/automerge';
import { useUserInfo } from 'utils/user';
import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from '@tanstack/react-query';
import { getToken } from '@cognite/cdf-sdk-singleton';

type Logger = (oldDoc: AFlow) => ChangeOptions<AFlow> | undefined;
type FlowContextT = {
  externalId: string;
  isComponentsPanelVisible: boolean;
  setIsComponentsPanelVisible: Dispatch<SetStateAction<boolean>>;
  changeFlow: (fn: Automerge.ChangeFn<AFlow>, logger?: Logger) => void;
  flow: AFlow;
  flowRef: MutableRefObject<AFlow>;
  changeNodes: (fn: AutomergeChangeNodesFn, logger?: Logger) => void;
  changeEdges: (fn: AutomergeChangeEdgesFn, logger?: Logger) => void;
  restoreWorkflow: (heads: Automerge.Heads) => void;
  nodes: CanvasNodes;
  edges: CanvasEdges;
  selectedObject?: string;
  setSelectedObject: Dispatch<SetStateAction<string | undefined>>;
  isHistoryVisible: boolean;
  setHistoryVisible: Dispatch<SetStateAction<boolean>>;
  previewHash?: string;
  setPreviewHash: Dispatch<SetStateAction<string | undefined>>;
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

type WSAuthenticationRequest = {
  jwt: string;
};

export const FlowContextProvider = ({
  externalId,
  children,
  initialFlow,
}: FlowContextProviderProps) => {
  const sdk = useSDK();
  const { data: token } = useQuery(['token'], getToken, {
    refetchInterval: 60000,
  });
  const [selectedObject, setSelectedObject] = useState<string | undefined>();
  const [isComponentsPanelVisible, setIsComponentsPanelVisible] =
    useState(false);
  const [isHistoryVisible, setHistoryVisible] = useState(false);
  const [previewHash, setPreviewHash] = useState<string | undefined>();
  const [flowState, setFlowState] = useState(initialFlow);
  const flowRef = useRef(initialFlow);
  const { data: userInfo } = useUserInfo();
  const { mutate: updateFlow } = useUpdateFlow();

  const [socket, setWS] = useState<WebSocket>();

  const externalFlowRef = useRef(initialFlow);

  const debouncedMutate = useMemo(() => {
    const mutate = (newFlow: AFlow) => {
      const changes = Automerge.getChanges(externalFlowRef.current, newFlow);
      externalFlowRef.current = newFlow;

      updateFlow(newFlow);

      if (changes.length > 0 && socket) {
        changes.forEach((change) => socket.send(change.buffer));
      }
    };

    return debounce(mutate, 500);
  }, [socket, updateFlow]);

  useEffect(() => {
    if (token) {
      const { host } = new URL(sdk.getBaseUrl());
      const ws = new WebSocket(
        `wss://${host}/apps/v1/projects/${sdk.project}/automerge-sync/flows/${externalId}`
      );

      ws.addEventListener('open', async () => {
        const authenticationRequest: WSAuthenticationRequest = {
          jwt: token,
        };
        ws.send(JSON.stringify(authenticationRequest));
        setWS(ws);
      });

      ws.addEventListener('close', () => {
        setWS(undefined);
      });
      ws.addEventListener('error', () => {
        setWS(undefined);
      });

      ws.addEventListener('message', (e: MessageEvent<Blob>) => {
        const reader = new FileReader();
        reader.addEventListener('loadend', () => {
          if (reader.result) {
            const data = new Uint8Array(reader.result as ArrayBuffer);
            const [newFlow] = Automerge.applyChanges(flowRef.current, [data]);
            flowRef.current = newFlow;
            setFlowState(newFlow);
          }
        });
        reader.readAsArrayBuffer(e.data);
      });
      return () => {
        ws.close();
      };
    }
  }, [externalId, token, sdk]);

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
        selectedObject,
        setSelectedObject,
        isHistoryVisible,
        setHistoryVisible,
        previewHash,
        setPreviewHash,
        restoreWorkflow,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
};
