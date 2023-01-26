import {
  Illustrations,
  Chip,
  OptionType,
  Select,
  Input,
} from '@cognite/cogs.js-v9';
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
  searchQueryValue: string;
  onWorkflowTypeValueChanged: (
    selectedWorkflowTypes: OptionType<string>[]
  ) => void;
  onStatusValueChanged: (
    selectedWorkflowStatuses: OptionType<string>[]
  ) => void;
  onSearchQueryValueChanged: (searchQueryValue: string) => void;
};
export const Workflows = ({
  workflowTypes,
  selectedWorkflowTypes,
  workflowStatuses,
  selectedWorkflowStatuses,
  workflows,
  searchQueryValue,
  onWorkflowTypeValueChanged,
  onStatusValueChanged,
  onSearchQueryValueChanged,
}: Props) => {
  return (
    <Container>
      <SearchAndFilter>
        <Input
          type="search"
          placeholder="Search"
          icon="Search"
          iconPlacement="left"
          onChange={(e) => onSearchQueryValueChanged(e.target.value)}
          value={searchQueryValue}
          clearable={{
            callback: () => {
              onSearchQueryValueChanged('');
            },
          }}
        />
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
          <Illustrations.Solo type="Code" />
          <div className="cogs-title-5">No results available</div>
          <div className="cogs-body-2">
            There are currently no workflows in progress
          </div>
          <div>
            {[...selectedWorkflowStatuses, ...selectedWorkflowTypes].map(
              (filter) => (
                <Chip
                  key={filter.value}
                  type="neutral"
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
                  label={filter.value}
                />
              )
            )}
            {!![...selectedWorkflowStatuses, ...selectedWorkflowTypes]
              .length && (
              <Chip
                icon="Close"
                iconPlacement="right"
                size="medium"
                style={{ borderRadius: '4px' }}
                onClick={() => {
                  onStatusValueChanged([]);
                  onWorkflowTypeValueChanged([]);
                }}
                label={<span className="cogs-body-2">Clear all</span>}
              />
            )}
          </div>
        </EmptyStateContainer>
      )}
    </Container>
  );
};
