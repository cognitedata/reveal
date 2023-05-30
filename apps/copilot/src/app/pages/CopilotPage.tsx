import { Copilot } from '@fusion/copilot-core';

import { getProject } from '@cognite/cdf-utilities';

import { useSubappType } from '../hooks/useSubappType';

export const CopilotPage = () => {
  const feature = useSubappType();

  return <Copilot feature={feature} project={getProject()} />;
};
