import React from 'react';
import { OptionType } from '@cognite/cogs.js';
import { useSelectFilter } from 'hooks';
import { Select } from 'components/Common';
import { statusData, StatusData, StatusType } from 'components/Filters';

type Props = {
  statusType?: StatusType[];
  setStatusType: (statusType: StatusType[]) => void;
};

export const StatusSelect = (props: Props) => {
  const { statusType, setStatusType } = props;

  const options = statusData.map(
    (status: StatusData): OptionType<React.ReactText> => ({
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
        title: 'Progress:',
        isMulti: true,
        options,
        onChange: setMultiSelection,
        value: currentSelection,
      }}
    />
  );
};

export {};
