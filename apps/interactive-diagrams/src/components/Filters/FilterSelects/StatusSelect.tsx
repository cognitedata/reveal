import React from 'react';
import { OptionType } from '@cognite/cogs.js';
import { useSelectFilter } from '@interactive-diagrams-app/hooks';
import { Select } from '@interactive-diagrams-app/components/Common';
import {
  approvalDetails,
  ReviewStatus,
  StatusType,
} from '@interactive-diagrams-app/components/Filters';

type Props = {
  statusType?: StatusType[];
  setStatusType: (statusType: StatusType[]) => void;
};

export const StatusSelect = (props: Props) => {
  const { statusType, setStatusType } = props;

  const options = Object.values(approvalDetails).map(
    (status: ReviewStatus): OptionType<React.ReactText> => ({
      label: status.label,
      value: status.type,
    })
  );

  const { currentSelection, setMultiSelection } = useSelectFilter<StatusType>(
    true,
    options,
    statusType,
    setStatusType
  );

  return (
    <Select
      selectProps={{
        title: 'Status:',
        isMulti: true,
        options,
        onChange: setMultiSelection,
        value: currentSelection,
      }}
    />
  );
};

export {};
