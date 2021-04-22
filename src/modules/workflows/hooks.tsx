import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { FileInfo } from '@cognite/sdk';
import { ResourceType } from 'modules/sdk-builder/types';
import {
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
  const getDiagrams = workflowDiagramsSelector(workflowId, all);
  const diagrams: FileInfo[] = useSelector(getDiagrams);
  return diagrams;
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
    [workflowId, all]
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
