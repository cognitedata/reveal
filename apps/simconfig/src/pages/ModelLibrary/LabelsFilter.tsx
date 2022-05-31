import { useSelector } from 'react-redux';

import { AutoComplete } from '@cognite/cogs.js';
import { useGetLabelsListQuery } from '@cognite/simconfig-api-sdk/rtk';

import { selectProject } from 'store/simconfigApiProperties/selectors';

interface Label {
  label: string;
  value: string;
}

interface LabelsFilterProps {
  selectedLabels: Label[];
  setSelectedLabels: (labels: Label[]) => void;
}

export function LabelsFilter({
  selectedLabels,
  setSelectedLabels,
}: LabelsFilterProps) {
  const project = useSelector(selectProject);
  const { data: labelsList } = useGetLabelsListQuery({ project });

  const onLabelsChange = (
    labels: { label: string; value: string }[] | undefined
  ) => {
    setSelectedLabels(labels ?? []);
  };
  return (
    <AutoComplete
      options={
        labelsList?.labels
          ? labelsList.labels.map((label) => ({
              value: label.externalId,
              label: label.name,
            }))
          : []
      }
      placeholder="Filter by labels."
      value={selectedLabels}
      isMulti
      onChange={onLabelsChange}
    />
  );
}
