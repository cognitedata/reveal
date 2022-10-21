import { useContext, useEffect, useMemo, useState } from 'react';
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom';
import { CogniteEvent } from '@cognite/sdk';
import { EVENT_TYPES, WORKFLOW_TYPES } from '@cognite/power-ops-api-types';
import { EventStreamContext } from 'providers/eventStreamProvider';
import { useFetchWorkflows } from 'queries/useFetchWorkflows';
import { Graphic, Label, OptionType, Select } from '@cognite/cogs.js';
import { useFetchWorkflowSchemas } from 'queries/useFetchWorkflowSchemas';
import { EVENT_STATUSES } from 'utils/utils';
import { useFetchWorkflowTypes } from 'queries/useFetchWorkflowTypes';
import queryString from 'query-string';
import { ReusableTable } from 'components/ReusableTable';

import { Container, EmptyStateContainer, SearchAndFilter } from './elements';
import { workflowsColumns } from './utils';

export const Workflows = () => {
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
        )
    );
  }, [workflows, search]);

  useEffect(() => {
    // Get filters from the URL
    const parsedURL = queryString.parse(search);
    if (parsedURL.workflowType) {
      setWorkflowTypeFilterValue(
        parsedURL.workflowType
          ?.toString()
          .split(',')
          .map((filter) => {
            return { label: filter, value: filter };
          })
      );
    }
    if (parsedURL.status) {
      setStatusFilterValue(
        parsedURL.status
          ?.toString()
          .split(',')
          .map((filter) => {
            return {
              label: filter,
              value: filter,
            };
          })
      );
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

  // Add filters to the URL
  useEffect(() => {
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

    history.replace({
      pathname: `${match.path}`,
      search: urlParams.toString(),
    });
  }, [workflowTypeFilterValue, statusFilterValue]);

  return (
    <Container>
      <SearchAndFilter>
        <Select
          theme="grey"
          title="Workflow type:"
          isMulti
          showSelectedItemCount
          value={workflowTypeFilterValue}
          options={
            workflowTypes?.map(({ workflowType }) => ({
              label: workflowType,
              value: workflowType,
            })) || []
          }
          onChange={(selected: OptionType<string>[]) => {
            setWorkflowTypeFilterValue(selected);
          }}
        />
        <Select
          theme="grey"
          title="Status:"
          isMulti
          showSelectedItemCount
          value={statusFilterValue}
          options={EVENT_STATUSES.map((status: string) => ({
            label: status,
            value: status,
          }))}
          onChange={(selected: OptionType<string>[]) => {
            setStatusFilterValue(selected);
          }}
        />
      </SearchAndFilter>
      {filteredWorkflows?.length ? (
        <ReusableTable data={filteredWorkflows} columns={workflowsColumns} />
      ) : (
        <EmptyStateContainer className="workflows">
          <Graphic type="Search" />
          <div className="cogs-title-5">No results available</div>
          <div className="cogs-body-2">
            There are currently no workflows in progress
          </div>
          <div>
            {[...statusFilterValue, ...workflowTypeFilterValue].map(
              (filter) => (
                <Label
                  key={filter.value}
                  variant="normal"
                  icon="Close"
                  iconPlacement="right"
                  size="medium"
                  style={{ borderRadius: '4px', marginRight: '8px' }}
                  onClick={() => {
                    setStatusFilterValue(
                      statusFilterValue.filter((value) => value !== filter)
                    );
                    setWorkflowTypeFilterValue(
                      workflowTypeFilterValue.filter(
                        (value) => value !== filter
                      )
                    );
                  }}
                >
                  {filter.value}
                </Label>
              )
            )}
            {!![...statusFilterValue, ...workflowTypeFilterValue].length && (
              <Label
                variant="unknown"
                icon="Close"
                iconPlacement="right"
                size="medium"
                style={{ borderRadius: '4px' }}
                onClick={() => {
                  setStatusFilterValue([]);
                  setWorkflowTypeFilterValue([]);
                }}
              >
                <span className="cogs-body-2">Clear all</span>
              </Label>
            )}
          </div>
        </EmptyStateContainer>
      )}
    </Container>
  );
};
