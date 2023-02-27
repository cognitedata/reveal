import { Asset, InternalId, Timeseries } from '@cognite/sdk';
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from 'react';

export type QuickMatchSteps =
  | 'sourceSelect'
  | 'targetSelect'
  | 'modelParams'
  | 'viewModel';
export const QuickMatchStepsOrder: Record<QuickMatchSteps, number> = {
  sourceSelect: 0,
  targetSelect: 1,
  modelParams: 2,
  viewModel: 3,
};
const QuickMatchStepsOrderIndex: Record<number, QuickMatchSteps> =
  Object.entries(QuickMatchStepsOrder).reduce(
    (accl, [k, v]) => ({ ...accl, [v]: k }),
    {}
  );

type SourceFilter = {
  dataSetIds: InternalId[];
};
type SourceType = 'timeseries';

type TimeseriesKeys = keyof Pick<Timeseries, 'unit' | 'name' | 'description'>;
type AssetKeys = keyof Pick<Asset, 'name' | 'description'>;

type ModelMapping = {
  [K in TimeseriesKeys]?: AssetKeys;
};

type QuickMatchContext = {
  unmatchedOnly: boolean;
  setUnmatchedOnly: Dispatch<SetStateAction<boolean>>;

  sourceType: SourceType;
  setSourceType: Dispatch<SetStateAction<SourceType>>;

  allSources: boolean;
  setAllSources: Dispatch<SetStateAction<boolean>>;

  sourcesList: InternalId[];
  setSourcesList: Dispatch<SetStateAction<InternalId[]>>;

  sourceFilter: SourceFilter;
  setSourceFilter: Dispatch<SetStateAction<SourceFilter>>;

  allTargets: boolean;
  setAllTargets: Dispatch<SetStateAction<boolean>>;

  targetsList: InternalId[];
  setTargetsList: Dispatch<SetStateAction<InternalId[]>>;

  step: QuickMatchSteps;
  setStep: Dispatch<SetStateAction<QuickMatchSteps>>;
  hasNextStep: () => boolean;
  hasPrevStep: () => boolean;
  pushStep: () => void;
  popStep: () => void;

  modelFieldMapping: ModelMapping;
  setModelFieldMapping: Dispatch<SetStateAction<ModelMapping>>;

  modelId?: number;
  setModelId: Dispatch<SetStateAction<number | undefined>>;

  jobId?: number;
  setJobId: Dispatch<SetStateAction<number | undefined>>;
};

export const QuickMatchContext = createContext<QuickMatchContext>({
  allSources: false,
  sourcesList: [],
  setSourcesList: function (_: SetStateAction<InternalId[]>): void {
    throw new Error('Function not implemented.');
  },
  allTargets: false,
  setAllTargets: function (_: SetStateAction<boolean>): void {
    throw new Error('Function not implemented.');
  },
  targetsList: [],
  setTargetsList: function (_: SetStateAction<InternalId[]>): void {
    throw new Error('Function not implemented.');
  },
  step: 'sourceSelect',

  setAllSources: function (_: SetStateAction<boolean>): void {
    throw new Error('Function not implemented.');
  },
  sourceFilter: {
    dataSetIds: [],
  },
  setSourceFilter: function (_: SetStateAction<SourceFilter>): void {
    throw new Error('Function not implemented.');
  },
  hasNextStep: function (): boolean {
    throw new Error('Function not implemented.');
  },
  hasPrevStep: function (): boolean {
    throw new Error('Function not implemented.');
  },
  pushStep: function (): void {
    throw new Error('Function not implemented.');
  },
  popStep: function (): void {
    throw new Error('Function not implemented.');
  },
  setStep: function (_: SetStateAction<QuickMatchSteps>): void {
    throw new Error('Function not implemented.');
  },
  sourceType: 'timeseries',
  setSourceType: function (_: SetStateAction<'timeseries'>): void {
    throw new Error('Function not implemented.');
  },
  modelFieldMapping: {},
  setModelFieldMapping: function (_: SetStateAction<ModelMapping>): void {
    throw new Error('Function not implemented.');
  },
  setModelId: function (_: SetStateAction<number | undefined>): void {
    throw new Error('Function not implemented.');
  },
  setJobId: function (_: SetStateAction<number | undefined>): void {
    throw new Error('Function not implemented.');
  },

  setUnmatchedOnly: function (_: SetStateAction<boolean>): void {
    throw new Error('Function not implemented.');
  },
  unmatchedOnly: false,
});

export const useQuickMatchContext = () => useContext(QuickMatchContext);

export const QuickMatchContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [unmatchedOnly, setUnmatchedOnly] = useState(false);
  const [allSources, setAllSources] = useState(false);
  const [sourcesList, setSourcesList] = useState<InternalId[]>([]);
  const [allTargets, setAllTargets] = useState(false);
  const [targetsList, setTargetsList] = useState<InternalId[]>([]);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>({
    dataSetIds: [],
  });
  const [modelId, setModelId] = useState<number | undefined>();
  const [jobId, setJobId] = useState<number | undefined>();

  const [modelFieldMapping, setModelFieldMapping] = useState<ModelMapping>({
    name: 'name',
  });
  const [sourceType, setSourceType] = useState<SourceType>('timeseries');
  const [step, setStep] = useState<QuickMatchSteps>('sourceSelect');

  const hasNextStep = () => {
    const stepIndex = Object.values(QuickMatchStepsOrder);
    const nextStep = QuickMatchStepsOrder[step] + 1;
    return stepIndex.includes(nextStep);
  };

  const hasPrevStep = () => {
    const stepIndex = Object.values(QuickMatchStepsOrder);
    const nextStep = QuickMatchStepsOrder[step] - 1;
    return stepIndex.includes(nextStep);
  };

  const pushStep = () => {
    if (!hasNextStep()) {
      throw new Error('No futher steps');
    }
    const i = QuickMatchStepsOrder[step];
    const next = QuickMatchStepsOrderIndex[i + 1];
    setStep(next);
  };
  const popStep = () => {
    if (!hasPrevStep()) {
      throw new Error('No steps before this');
    }
    const i = QuickMatchStepsOrder[step];
    const next = QuickMatchStepsOrderIndex[i - 1];
    setStep(next);
  };
  return (
    <QuickMatchContext.Provider
      value={{
        allSources,
        setAllSources,
        sourcesList,
        setSourcesList,
        allTargets,
        setAllTargets,
        targetsList,
        setTargetsList,
        step,
        setStep,
        hasNextStep,
        hasPrevStep,
        pushStep,
        popStep,
        sourceFilter,
        setSourceFilter,
        sourceType,
        setSourceType,
        modelFieldMapping,
        setModelFieldMapping,
        modelId,
        setModelId,
        jobId,
        setJobId,
        unmatchedOnly,
        setUnmatchedOnly,
      }}
    >
      {children}
    </QuickMatchContext.Provider>
  );
};
