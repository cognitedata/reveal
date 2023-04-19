import * as Automerge from '@automerge/automerge';
import { useFlow, useUpdateFlow } from 'hooks/files';
import { debounce, isEqual } from 'lodash';
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
import { AFlow } from 'types';

type FlowContextT = {
  externalId: string;
  isComponentsPanelVisible: boolean;
  setIsComponentsPanelVisible: Dispatch<SetStateAction<boolean>>;
  changeFlow: (fn: Automerge.ChangeFn<AFlow>) => void;
  flow: AFlow;
  flowRef: MutableRefObject<AFlow>;
};
export const WorkflowContext = createContext<FlowContextT>(undefined!);

export const useWorkflowBuilderContext = () => useContext(WorkflowContext);

type FlowContextProviderProps = {
  externalId: string;
  children: ReactNode;
  initialFlow: AFlow;
};

export const FlowContextProvider = ({
  externalId,
  children,
  initialFlow,
}: FlowContextProviderProps) => {
  const [isComponentsPanelVisible, setIsComponentsPanelVisible] =
    useState(false);
  const [flowState, setFlowState] = useState(initialFlow);
  const flowRef = useRef(initialFlow);

  const changeFlow = useCallback((fn: Automerge.ChangeFn<AFlow>) => {
    const newFlow = Automerge.change(flowRef.current, fn);
    flowRef.current = newFlow;
    setFlowState(newFlow);
  }, []);

  const { data } = useFlow(externalId, {
    staleTime: Infinity,
    refetchInterval: 60000,
  });

  const { mutate } = useUpdateFlow();

  const debouncedMutate = useMemo(() => debounce(mutate, 500), [mutate]);

  useEffect(() => {
    if (flowState) {
      debouncedMutate(flowState);
    }
  }, [flowState, debouncedMutate]);

  useEffect(() => {
    if (!data) {
      return;
    }
    if (
      !isEqual(Automerge.getHeads(flowRef.current), Automerge.getHeads(data))
    ) {
      const mergedDoc = Automerge.merge(flowRef.current, data);
      flowRef.current = mergedDoc;
      setFlowState(mergedDoc);
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
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
};
