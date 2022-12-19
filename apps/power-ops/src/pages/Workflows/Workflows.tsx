import { Graphic, Label, OptionType, Select } from '@cognite/cogs.js';
import { CommonTable } from 'components/CommonTable';
import { Workflow } from '@cognite/power-ops-api-types';

import { Container, EmptyStateContainer, SearchAndFilter } from './elements';
import { workflowsColumns } from './utils';

type Props = {
  workflowTypes: { label: string; value: string }[];
  selectedWorkflowTypes: OptionType<string>[];
  workflowStatuses: { label: string; value: string }[];
  selectedWorkflowStatuses: OptionType<string>[];
  workflows: Workflow[];
  onWorkflowTypeValueChanged: (
    selectedWorkflowTypes: OptionType<string>[]
  ) => void;
  onStatusValueChanged: (
    selectedWorkflowStatuses: OptionType<string>[]
  ) => void;
};
export const Workflows = ({
  workflowTypes,
  selectedWorkflowTypes,
  workflowStatuses,
  selectedWorkflowStatuses,
  workflows,
  onWorkflowTypeValueChanged,
  onStatusValueChanged,
}: Props) => {
  return (
    <Container>
      <SearchAndFilter>
        <Select
          theme="grey"
          title="Workflow type:"
          isMulti
          showSelectedItemCount
          value={selectedWorkflowTypes}
          options={workflowTypes}
          onChange={(selected: OptionType<string>[]) => {
            onWorkflowTypeValueChanged(selected);
          }}
        />
        <Select
          theme="grey"
          title="Status:"
          isMulti
          showSelectedItemCount
          value={selectedWorkflowStatuses}
          options={workflowStatuses}
          onChange={(selected: OptionType<string>[]) => {
            onStatusValueChanged(selected);
          }}
        />
      </SearchAndFilter>
      {workflows.length ? (
        <CommonTable data={workflows} columns={workflowsColumns} />
      ) : (
        <EmptyStateContainer className="workflows">
          <Graphic type="Search" />
          <div className="cogs-title-5">No results available</div>
          <div className="cogs-body-2">
            There are currently no workflows in progress
          </div>
          <div>
            {[...selectedWorkflowStatuses, ...selectedWorkflowTypes].map(
              (filter) => (
                <Label
                  key={filter.value}
                  variant="normal"
                  icon="Close"
                  iconPlacement="right"
                  size="medium"
                  style={{ borderRadius: '4px', marginRight: '8px' }}
                  onClick={() => {
                    onStatusValueChanged(
                      selectedWorkflowStatuses.filter(
                        (value) => value !== filter
                      )
                    );
                    onWorkflowTypeValueChanged(
                      selectedWorkflowTypes.filter((value) => value !== filter)
                    );
                  }}
                >
                  {filter.value}
                </Label>
              )
            )}
            {!![...selectedWorkflowStatuses, ...selectedWorkflowTypes]
              .length && (
              <Label
                variant="unknown"
                icon="Close"
                iconPlacement="right"
                size="medium"
                style={{ borderRadius: '4px' }}
                onClick={() => {
                  onStatusValueChanged([]);
                  onWorkflowTypeValueChanged([]);
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
