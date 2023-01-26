import { useContext, useEffect, useMemo, useState } from 'react';
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom-v5';
import { CogniteEvent } from '@cognite/sdk';
import { EVENT_TYPES, WORKFLOW_TYPES } from '@cognite/power-ops-api-types';
import { EventStreamContext } from 'providers/eventStreamProvider';
import { useFetchWorkflows } from 'queries/useFetchWorkflows';
import { OptionType } from '@cognite/cogs.js-v9';
import { useFetchWorkflowSchemas } from 'queries/useFetchWorkflowSchemas';
import { useFetchWorkflowTypes } from 'queries/useFetchWorkflowTypes';
import queryString from 'query-string';
import { EVENT_STATUSES } from 'utils/utils';
import debounce from 'lodash/debounce';

import { Workflows } from './Workflows';

export const WorkflowsContainer = () => {
  const { eventStore } = useContext(EventStreamContext);

  const match = useRouteMatch();
  const history = useHistory();
  const { search } = useLocation();
  const urlParams = useMemo(() => new URLSearchParams(search), [search]);

  const { data: workflowTypes } = useFetchWorkflowTypes();
  const { data: { workflowSchemas } = { workflowSchemas: [], count: 0 } } =
    useFetchWorkflowSchemas();

  const {
    data: { workflows } = { workflows: [], count: 0 },
    refetch: refetchWorkflows,
  } = useFetchWorkflows();

  const [workflowTypeFilterValue, setWorkflowTypeFilterValue] = useState<
    OptionType<string>[]
  >([]);

  const [statusFilterValue, setStatusFilterValue] = useState<
    OptionType<string>[]
  >([]);

  const [searchQueryValue, setSearchQueryValue] = useState<string>('');
  const [searchInputValue, setSearchInputValue] = useState<string>('');

  const debouncedSearch = useMemo(() => {
    return debounce(setSearchQueryValue, 300);
  }, []);

  const handleSearch = (value: string) => {
    setSearchInputValue(value);
    debouncedSearch(value);
  };

  const isWorkflowEvent = async (needle: string): Promise<boolean> => {
    return !!(
      workflowSchemas?.some((schema) => schema.workflowType === needle) ||
      workflowSchemas?.some((schema) => needle.includes(schema.workflowType))
    );
  };

  const processEvent = async (event: CogniteEvent): Promise<void> => {
    if (!event.externalId) return;

    switch (event.type) {
      case WORKFLOW_TYPES.DAY_AHEAD_BID_MATRIX_CALCULATION:
        if (await isWorkflowEvent(event.externalId)) {
          refetchWorkflows({ cancelRefetch: true });
        }
        break;
      case EVENT_TYPES.PROCESS_STARTED:
      case EVENT_TYPES.PROCESS_FAILED:
      case EVENT_TYPES.PROCESS_FINISHED:
        // For status Events, we check that they are attached to (parent) Bid Processes and not to sub-processes.
        if (
          event.metadata?.event_external_id &&
          (await isWorkflowEvent(event.metadata.event_external_id))
        )
          refetchWorkflows({ cancelRefetch: true });
        break;
    }
  };

  const filteredWorkflows = useMemo(() => {
    return workflows.filter(
      // Filter workflows by filters
      (workflow) =>
        Object.values(workflow).some((value) =>
          workflowTypeFilterValue.length
            ? workflowTypeFilterValue
                .map((filter) => filter.value)
                .includes(value?.toString())
            : true
        ) &&
        Object.values(workflow).some((value) =>
          statusFilterValue.length
            ? statusFilterValue
                .map((filter) => filter.label.toLowerCase())
                .includes(String(value).toLowerCase())
            : true
        ) &&
        // Filter workflows by search query
        (workflow.eventExternalId
          .toLowerCase()
          .includes(searchQueryValue.toLowerCase()) ||
          workflow.eventType
            .toLowerCase()
            .includes(searchQueryValue.toLowerCase()))
    );
  }, [workflows, search]);

  useEffect(() => {
    // Get filters from the URL
    const parsedURL = queryString.parse(search);
    if (parsedURL.workflowType) {
      setWorkflowTypeFilterValue(
        parsedURL.workflowType
          .toString()
          .split(',')
          .map((filter) => {
            return { label: filter, value: filter };
          })
      );
    }
    if (parsedURL.status) {
      setStatusFilterValue(
        parsedURL.status
          .toString()
          .split(',')
          .map((filter) => {
            return {
              label: filter,
              value: filter,
            };
          })
      );
    }

    // Get search query from the URL
    if (parsedURL.searchQuery) {
      setSearchQueryValue(parsedURL.searchQuery.toString());
      setSearchInputValue(parsedURL.searchQuery.toString());
    }

    // Fetch Workflows list
    refetchWorkflows({ cancelRefetch: true });

    // Subscribe to SSE events
    const subscription = eventStore?.subscribe(({ event }) => {
      processEvent(event);
    });
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Add filters to the URL
    if (workflowTypeFilterValue.length) {
      urlParams.set(
        'workflowType',
        workflowTypeFilterValue.map((filter) => filter.value).join(',')
      );
    } else {
      urlParams.delete('workflowType');
    }
    if (statusFilterValue.length) {
      urlParams.set(
        'status',
        statusFilterValue.map((filter) => filter.value).join(',')
      );
    } else {
      urlParams.delete('status');
    }

    // Add search query to the URL
    if (searchQueryValue) {
      urlParams.set('searchQuery', searchQueryValue);
    } else {
      urlParams.delete('searchQuery');
    }

    history.replace({
      pathname: `${match.path}`,
      search: urlParams.toString(),
    });
  }, [workflowTypeFilterValue, statusFilterValue, searchQueryValue]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, []);

  return (
    <Workflows
      workflowTypes={
        workflowTypes?.map(({ workflowType }) => ({
          label: workflowType,
          value: workflowType,
        })) || []
      }
      selectedWorkflowTypes={workflowTypeFilterValue}
      workflowStatuses={EVENT_STATUSES.map((status: string) => ({
        label: status,
        value: status,
      }))}
      selectedWorkflowStatuses={statusFilterValue}
      workflows={filteredWorkflows}
      searchQueryValue={searchInputValue}
      onWorkflowTypeValueChanged={setWorkflowTypeFilterValue}
      onStatusValueChanged={setStatusFilterValue}
      onSearchQueryValueChanged={handleSearch}
    />
  );
};
