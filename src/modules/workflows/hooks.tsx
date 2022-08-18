import { useMemo, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useCdfItems, useList } from '@cognite/sdk-react-query-hooks';
import { Asset, FileInfo, IdEither } from '@cognite/sdk';
import { useLocalStorage } from '@cognite/cogs.js';
import { diagramSelection } from 'routes/paths';
import { AppStateContext } from 'context';
import { LS_SAVED_SETTINGS } from 'stringConstants';
import { ResourceType } from 'modules/sdk-builder/types';
import {
  standardModelOptions,
  createNewWorkflow,
  countOfLoadedDiagramsForWorkflowSelector,
  countOfLoadedResourcesForWorkflowSelector,
  countOfTotalDiagramsForWorkflowSelector,
  countOfTotalResourcesForWorkflowSelector,
  workflowDiagramsSelector,
  workflowAllResourcesSelector,
  workflowDiagramStatusSelector,
  workflowResourceStatusSelector,
  workflowAllResourcesStatusSelector,
} from 'modules/workflows';
import { selectParsingJobs } from 'hooks';
import { RootState } from 'store/reducer';
import { NUM_OF_RESOURCES_CHECKED, getUrlWithQueryParams } from 'utils/config';

/**
 * Creates a new workflow.
 */
export const useWorkflowCreateNew = () => {
  const { tenant } = useContext(AppStateContext);
  const dispatch = useDispatch();
  const history = useHistory();

  const [savedSettings] = useLocalStorage(LS_SAVED_SETTINGS, {
    skip: false,
    modelSelected: 'standard',
  });

  const createWorkflow = (args?: any) => {
    const newWorkflowId = Number(new Date());
    const options =
      savedSettings?.skip && savedSettings?.options
        ? savedSettings.options
        : standardModelOptions;
    dispatch(
      createNewWorkflow({ workflowId: newWorkflowId, options, ...(args ?? {}) })
    );
    history.push(
      getUrlWithQueryParams(
        diagramSelection.path(tenant, String(newWorkflowId))
      )
    );
  };

  return { createWorkflow };
};

/**
 * Returns all the items data associated with the specific workflow.
 * @param workflowId
 * @param type - 'diagrams' in case of diagrams, or ResourceType in case of resources
 * @param all
 */
export const useWorkflowItems = (workflowId: number, all: boolean = false) => {
  const diagrams = useWorkflowDiagrams(workflowId, all);
  const resources = useWorkflowResources(workflowId, all);
  return { diagrams, resources };
};

/**
 * Returns all diagrams associated with the specific workflow.
 * @param workflowId
 * @param all
 */
export const useWorkflowDiagrams = (
  workflowId: number,
  all: boolean = false
) => {
  const getDiagrams = useMemo(
    () => workflowDiagramsSelector(workflowId, all),
    [all, workflowId]
  );
  const diagrams: FileInfo[] = useSelector(getDiagrams);
  return diagrams;
};

/**
 * Returns all diagrams IDs associated with the specific workflow.
 * @param workflowId
 * @param all
 */
export const useWorkflowDiagramsIds = (
  workflowId: number,
  all: boolean = false,
  ignoreFailed: boolean = false
) => {
  const parsingJob = useSelector(selectParsingJobs);
  const failedFiles =
    parsingJob?.failedFiles?.map((file: any) => file.fileId) ?? [];
  const getDiagrams = useMemo(
    () => workflowDiagramsSelector(workflowId, all),
    [all, workflowId]
  );
  const diagrams: FileInfo[] = useSelector(getDiagrams);
  if (ignoreFailed)
    return diagrams
      .filter((el: any) => !failedFiles.includes(el.id))
      .map((item) => item.id);
  return diagrams.map((item) => item.id);
};

/**
 * Returns all resources associated with the specific workflow.
 * @param workflowId
 * @param all
 */
export const useWorkflowResources = (
  workflowId: number,
  all: boolean = false
) => {
  const getResources = useMemo(
    () => workflowAllResourcesSelector(workflowId, all),
    [all, workflowId]
  );
  const resources = useSelector(getResources);

  return resources;
};

/**
 * Returns an info of how many resources requested for the particular workflow were already downloaded.
 * Returns for both diagrams and the resources.
 * @param workflowId: number
 */
export const useWorkflowLoadedCounts = (workflowId: number) => {
  const diagramsSelector = useMemo(
    () => countOfLoadedDiagramsForWorkflowSelector(workflowId, true),
    [workflowId]
  );
  const resourcesSelector = useMemo(
    () => countOfLoadedResourcesForWorkflowSelector(workflowId, true),
    [workflowId]
  );

  const diagrams = useSelector(diagramsSelector);
  const resources = useSelector(resourcesSelector);

  return {
    diagrams,
    resources,
  };
};

/**
 * Returns an info of how many resources requested for the particular workflow are there in total.
 * Returns for both diagrams and the resources.
 * @param workflowId: number
 */
export const useWorkflowTotalCounts = (workflowId: number) => {
  const diagrams = useSelector(
    countOfTotalDiagramsForWorkflowSelector(workflowId)
  );
  const resources = useSelector(
    countOfTotalResourcesForWorkflowSelector(workflowId)
  );
  return {
    diagrams,
    resources,
  };
};

/**
 * Returns an info of how many of the workflow resources are already loaded.
 * @param workflowId
 * @param all
 * @returns
 */
export const useWorkflowLoadPercentages = (
  workflowId: number,
  type: ResourceType | 'diagrams' = 'assets'
) => {
  const workflowLoadedCounts = useWorkflowLoadedCounts(Number(workflowId));
  const workflowTotalCounts = useWorkflowTotalCounts(Number(workflowId));
  const diagrams = type === 'diagrams';

  const downloadedCount: number = diagrams
    ? workflowLoadedCounts.diagrams
    : workflowLoadedCounts.resources?.[type] ?? 0;
  const totalCount: number = diagrams
    ? workflowTotalCounts.diagrams
    : workflowTotalCounts.resources?.[type as ResourceType] ?? 0;
  const loadedPercent: number = Math.round(
    (totalCount ? downloadedCount / totalCount : 0) * 100
  );
  const isLoaded = loadedPercent === 100;

  return { downloadedCount, totalCount, loadedPercent, isLoaded };
};

/**
 * Returns an info of how much of the entire workflow is already loaded.
 * @param workflowId
 * @param all
 * @returns
 */
export const useWorkflowAllLoadPercentages = (workflowId: number) => {
  const workflowLoadedCounts = useWorkflowLoadedCounts(Number(workflowId));
  const workflowTotalCounts = useWorkflowTotalCounts(Number(workflowId));

  const totalCount = [
    ...Object.values(workflowTotalCounts?.resources ?? {}),
    workflowTotalCounts?.diagrams ?? 0,
  ].reduce((sum, count) => sum + count, 0);

  const downloadedCount = [
    ...Object.values(workflowLoadedCounts?.resources ?? {}),
    workflowLoadedCounts?.diagrams ?? 0,
  ].reduce((sum, count) => sum + count, 0);

  const loadedPercent: number = Math.round(
    (totalCount ? downloadedCount / totalCount : 0) * 100
  );
  const isLoaded = loadedPercent === 100;

  return { downloadedCount, totalCount, loadedPercent, isLoaded };
};

/**
 * Returns aggregated statuses for the entire workflow.
 * @param workflowId
 * @param all
 */
export const useWorkflowStatus = (workflowId: number, all?: boolean) => {
  const diagramsStatus = useWorkflowDiagramsStatus(workflowId, all);
  const resourcesStatus = useWorkflowAllResourcesStatus(workflowId, all);
  return { diagramsStatus, resourcesStatus };
};

/**
 * Returns status of the diagrams for the particular workflow.
 * @param workflowId
 * @param all
 */
export const useWorkflowDiagramsStatus = (
  workflowId: number,
  all?: boolean
) => {
  const diagramsStatus = useSelector(
    workflowDiagramStatusSelector(workflowId, all)
  );
  return diagramsStatus;
};

/**
 * Returns status of the particular resource type for the particular workflow.
 * @param workflowId
 * @param all
 * @param resourceType
 */
export const useWorkflowResourceStatus = (
  workflowId: number,
  resourceType: ResourceType,
  all?: boolean
) => {
  const resourcesStatus = useSelector(
    workflowResourceStatusSelector(workflowId, resourceType, all)
  );
  return resourcesStatus;
};

/**
 * Returns aggregated status of the ALL resources for the particular workflow.
 * @param workflowId
 * @param all
 */
export const useWorkflowAllResourcesStatus = (
  workflowId: number,
  all?: boolean
) => {
  const resourcesStatus = useSelector(
    workflowAllResourcesStatusSelector(workflowId, all)
  );
  return resourcesStatus;
};

// TO BE REMOVED LATER
export const useSomeResources = (workflowId: number) => {
  const resources = useSelector(
    (state: RootState) => state.workflows.items[workflowId].resources
  );

  const assetSelection = (resources ?? [])?.find(
    (item) => item.type === 'assets'
  );
  const fileSelection = (resources ?? [])?.find(
    (item) => item.type === 'files'
  );

  const isAssetsList = assetSelection?.endpoint === 'list';
  const isFilesList = fileSelection?.endpoint === 'list';

  const { data: assetsRetrieve } = useCdfItems<Asset>(
    'assets',
    Array.isArray(assetSelection?.filter)
      ? (assetSelection?.filter as IdEither[])
      : [],
    true,
    {
      enabled: !!assetSelection && !isAssetsList,
    }
  );
  const { data: filesRetrieve } = useCdfItems<FileInfo>(
    'files',
    Array.isArray(fileSelection?.filter)
      ? (fileSelection?.filter as IdEither[])
      : [],
    true,
    {
      enabled: !!fileSelection && !isFilesList,
    }
  );

  const { data: assetsList } = useList<Asset>(
    'assets',
    {
      filter: assetSelection?.filter?.filter ?? {},
      limit: NUM_OF_RESOURCES_CHECKED,
    },
    { enabled: !!assetSelection && isAssetsList }
  );

  const { data: filesList } = useList<FileInfo>(
    'files',
    {
      filter: fileSelection?.filter?.filter ?? {},
      limit: NUM_OF_RESOURCES_CHECKED,
    },
    { enabled: !!fileSelection && isFilesList }
  );

  return {
    assets: (isAssetsList ? assetsList : assetsRetrieve) ?? [],
    files: (isFilesList ? filesList : filesRetrieve) ?? [],
  };
};
