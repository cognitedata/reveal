import * as React from 'react';

import get from 'lodash/get';

import { Flex } from '@cognite/cogs.js';

import { LeftPanel } from './LeftPanel';
import { projectConfigMetadata } from './metadata';
import { RightPanel } from './RightPanel';
import { Config, HandleMetadataChange } from './types';

interface Props {
  config: Config;
  onChange: HandleMetadataChange;
}

export const ProjectConfigForm: React.FC<Props> = ({ onChange, config }) => {
  const [selectedPath, setSelectedPath] = React.useState<string>('general');
  const selectedMetadata = get(projectConfigMetadata, selectedPath);
  const valuePath = selectedPath.replace(/\.children/g, '');

  return (
    <Flex gap={10}>
      <LeftPanel
        metadata={projectConfigMetadata}
        selected={selectedPath}
        setSelected={setSelectedPath}
      />
      <RightPanel
        metadataConfig={selectedMetadata}
        onChange={onChange}
        value={get(config, valuePath)}
        valuePath={valuePath}
      />
    </Flex>
  );
};
