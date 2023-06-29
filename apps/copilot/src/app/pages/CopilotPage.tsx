import { Copilot } from '@fusion/copilot-core';

import sdk from '@cognite/cdf-sdk-singleton';

export const CopilotPage = () => {
  return <Copilot sdk={sdk} />;
};
