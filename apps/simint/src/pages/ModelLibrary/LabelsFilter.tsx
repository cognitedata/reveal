import { useSelector } from 'react-redux';

import { Select } from '@cognite/cogs.js';
import type { LabelDetails } from '@cognite/simconfig-api-sdk/rtk';
import { useGetLabelsListQuery } from '@cognite/simconfig-api-sdk/rtk';

import { selectProject } from '../../store/simconfigApiProperties/selectors';

interface Label {
  label: string;
  value: string;
}

interface LabelsFilterProps {
  selectedLabels: Label[];
  setSelectedLabels: (labels: Label[]) => void;
}

//
// This is a type predicate which checks that the label's values are defined. This is used
// because LabelDetails has both name and externalId as optional and Select will complain
// if any options have value or label as undefined.
//
const isLabelDetailsWithValues = (
  label: LabelDetails
): label is {
  name: string;
  externalId: string;
} => label.name !== undefined && label.externalId !== undefined;

export function LabelsFilter({
  selectedLabels,
  setSelectedLabels,
}: LabelsFilterProps) {
  const project = useSelector(selectProject);
  const { data: labelsList } = useGetLabelsListQuery({ project });

  // filter out any labels that don't have both name and externalId defined
  const options =
    labelsList?.labels?.filter(isLabelDetailsWithValues).map((label) => ({
      value: label.externalId,
      label: label.name,
    })) ?? [];

  const onLabelsChange = (
    labels: { label: string; value: string }[] | undefined
  ) => {
    setSelectedLabels(labels ?? []);
  };

  return (
    <Select
      options={options}
      placeholder="Filter by labels"
      value={selectedLabels}
      isMulti
      onChange={onLabelsChange}
    />
  );
}
