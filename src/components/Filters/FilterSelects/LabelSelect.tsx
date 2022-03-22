import React from 'react';

import { getFlow } from '@cognite/cdf-sdk-singleton';
import { LabelDefinition } from '@cognite/sdk';
import { useList, usePermissions } from '@cognite/sdk-react-query-hooks';
import { useSelectFilter } from 'hooks';
import { Select } from 'components/Common';

type Props = {
  selectedLabels?: string[];
  onLabelsSelected: (selectedLabels: string[]) => void;
};

export const LabelSelect = (props: Props) => {
  const { selectedLabels, onLabelsSelected } = props;
  const { flow } = getFlow();
  const { data: hasPermission } = usePermissions(flow, 'labelsAcl', 'READ');
  const { data: labels } = useList<LabelDefinition>(
    'labels',
    { filter: {}, limit: 1000 },
    {
      enabled: hasPermission,
    },
    true
  );
  const isLoaded = Boolean(labels);

  const options = (labels ?? []).map((label: LabelDefinition) => ({
    label: label.name,
    value: label.externalId,
  }));

  const { currentSelection, setMultiSelection } = useSelectFilter<string>(
    isLoaded,
    options,
    selectedLabels,
    onLabelsSelected
  );

  return (
    <Select
      tooltipProps={{
        tooltipContent:
          'You do not have access to labels, please make sure you have labelsAcl:READ',
        hasPermission,
        isLoaded,
      }}
      selectProps={{
        title: 'Label:',
        options,
        isDisabled: !hasPermission,
        onChange: setMultiSelection,
        value: currentSelection,
        isMulti: true,
      }}
    />
  );
};
