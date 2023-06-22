import { Copilot } from '@fusion/copilot-core';

import sdk from '@cognite/cdf-sdk-singleton';

import { useSubappType } from '../hooks/useSubappType';

export const CopilotPage = () => {
  const feature = useSubappType();

  return <Copilot feature={feature} sdk={sdk} />;
};
