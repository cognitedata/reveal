import React from 'react';
import { Button } from '@cognite/cogs.js';

import Or from '../common/Or';
import useSpecifyCluster from '../../hooks/useSpecifyCluster';

interface DefaultClusterProps {
  projectName: string;
  loading: boolean;
  login: () => void;
}

const DefaultCluster = ({
  loading,
  login,
  projectName,
}: DefaultClusterProps) => {
  const [, setSpecifyCluster] = useSpecifyCluster();

  const onContinueClick = () => {
    if (projectName !== '') login();
  };

  return (
    <>
      <Button
        block
        type="primary"
        variant="default"
        loading={loading as boolean}
        onClick={onContinueClick}
      >
        Continue
      </Button>
      <Or />
      <Button
        block
        type="secondary"
        variant="default"
        onClick={() => setSpecifyCluster(true)}
      >
        Specify cluster
      </Button>
    </>
  );
};

export default DefaultCluster;
