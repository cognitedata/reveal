import React, { useContext } from 'react';
import { Button } from '@cognite/cogs.js';

import LoginContext from '../../context';
import { Box, Flex } from '../common';
import ClusterSelect from '../common/ClusterSelect';
import useSpecifyCluster from '../../hooks/useSpecifyCluster';

interface SpecifiedClusterProps {
  projectName: string;
  loading: boolean;
  login: () => void;
}

const SpecifiedCluster = ({
  loading,
  login,
  projectName,
}: SpecifiedClusterProps) => {
  const { clusters } = useContext(LoginContext);
  const [, setSpecifyCluster] = useSpecifyCluster();
  const clustersWithLegacyAuth = clusters
    .map((c) => ({
      ...c,
      options: c.options.filter((o) => o.legacyAuth),
    }))
    .filter((c) => c.options.length > 0);

  const onContinueClick = () => {
    if (projectName !== '') login();
  };

  return (
    <>
      <ClusterSelect clusters={clustersWithLegacyAuth} />
      <Flex direction="row" gap={20}>
        <Box flex={1}>
          <Button
            block
            type="secondary"
            variant="default"
            onClick={() => setSpecifyCluster(false)}
          >
            Back
          </Button>
        </Box>
        <Box flex={1}>
          <Button
            block
            type="primary"
            variant="default"
            loading={loading as boolean}
            onClick={onContinueClick}
          >
            Continue
          </Button>
        </Box>
      </Flex>
    </>
  );
};

export default SpecifiedCluster;
