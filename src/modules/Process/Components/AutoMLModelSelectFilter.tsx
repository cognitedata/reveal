import React from 'react';

import { Props, OptionTypeBase } from 'react-select';
import { Select, Tooltip } from '@cognite/cogs.js';
import { AutoMLModel } from 'src/api/vision/autoML/types';

type ModelOption = { id: number; value: number; name: string };

export type ModelSelectProps = Props<OptionTypeBase> & {
  onJobSelected: (jobId?: number, name?: string) => void;
  models?: AutoMLModel[];
  selectedModelId?: number;
};

/**
 * Model job select filter
 */
export const AutoMLModelSelectFilter = ({
  onJobSelected,
  models,
  selectedModelId,
  ...extraProps
}: ModelSelectProps) => {
  const options = (models || []).map((model, index) => ({
    label: `${model.name || 'Untitled model'} (${model.jobId})`,
    name: `${model.name || 'Untitled model'}`,
    value: index,
    id: model.jobId,
  }));
  const selectedOption = options.find((item) => item.id === selectedModelId);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { theme, ...filteredExtraProps } = extraProps; // theme type is not compatible for some reason, so remove it

  return (
    <Tooltip
      content={
        <span data-testid="text-content">{selectedOption?.label || ''}</span>
      }
      disabled={selectedOption == null}
    >
      <Select
        {...filteredExtraProps}
        options={options}
        value={selectedOption || []}
        onChange={(selected: ModelOption) => {
          onJobSelected(selected.id, selected.name);
        }}
      />
    </Tooltip>
  );
};
