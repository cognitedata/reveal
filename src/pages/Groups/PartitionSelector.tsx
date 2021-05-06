import React from 'react';

import Select from 'antd/lib/select';

interface PartitionSelectorProps {
  value: number[];
  onChange(newSelectedResources: number[]): void;
}

const PartitionSelector = ({
  value = [],
  onChange = () => {},
}: PartitionSelectorProps) => {
  return (
    <Select
      mode="tags"
      value={value}
      placeholder="Type the partitions' ids"
      onChange={onChange}
    />
  );
};

export default PartitionSelector;
