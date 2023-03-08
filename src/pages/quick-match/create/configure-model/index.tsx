import { Flex } from '@cognite/cogs.js';

import ModelConfiguration from 'components/model-configation';
import QuickMatchTitle from 'components/quick-match-title';

const ConfigureModel = (): JSX.Element => {
  return (
    <Flex direction="column" gap={8}>
      <QuickMatchTitle step="configure-model" />
      <ModelConfiguration />
    </Flex>
  );
};

export default ConfigureModel;
