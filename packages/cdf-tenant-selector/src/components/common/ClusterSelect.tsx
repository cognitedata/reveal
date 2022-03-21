import React, { useContext } from 'react';
import CreatableSelect from 'react-select/creatable';

import LoginContext from '../../context';
import { Cluster } from '../../types';

import { Text } from './index';

type Props = {
  clusters: {
    label: string;
    options: Cluster[];
  }[];
};

export default function ClusterSelect({ clusters }: Props) {
  const { cluster, setCluster } = useContext(LoginContext);

  const value = clusters
    .reduce((accl: Cluster[], group) => [...accl, ...group.options], [])
    .find((e) => e.value === cluster) || {
    value: cluster,
    label: cluster,
  };

  const onChange = (s: string) => {
    setCluster(s);
  };

  return (
    <div>
      <div>
        <Text>CDF cluster</Text>
        <Text color="red">*</Text>
      </div>
      <CreatableSelect
        value={value}
        onChange={(e) => {
          onChange(e?.value || '');
        }}
        formatCreateLabel={(e) => `Use: ${e}`}
        options={clusters}
      />
    </div>
  );
}
