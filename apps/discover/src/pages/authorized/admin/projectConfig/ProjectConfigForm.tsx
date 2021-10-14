import * as React from 'react';

import get from 'lodash/get';

import { FullContainer } from './elements';
import { LeftPanel } from './LeftPanel';
import { RightPanel } from './RightPanel';
import { Config, HandleMetadataChange, Metadata } from './types';

interface Props {
  config: Config;
  onChange: HandleMetadataChange;
  onUpdate: () => void;
  onReset: () => void;
  hasChanges: boolean;
  metadata: Metadata;
}

export const adaptedSelectedPathToMetadataPath = (selectedPath = '') =>
  selectedPath.replace(/\.\d+/g, '').replace(/\./g, '.children.');

export const ProjectConfigForm: React.FC<Props> = ({
  onChange,
  onUpdate,
  onReset,
  hasChanges,
  config,
  metadata,
}) => {
  const [selectedPath, setSelectedPath] = React.useState<string>('general');
  const metadataPath = React.useMemo(
    () => adaptedSelectedPathToMetadataPath(selectedPath),
    [selectedPath]
  );
  const selectedMetadata = get(metadata, metadataPath);
  const valuePath = selectedPath;

  return (
    <FullContainer>
      <LeftPanel
        metadata={metadata}
        selected={selectedPath}
        setSelected={setSelectedPath}
        config={config}
      />
      <RightPanel
        metadataConfig={selectedMetadata}
        onChange={onChange}
        onUpdate={onUpdate}
        onReset={onReset}
        hasChanges={hasChanges}
        value={get(config, valuePath)}
        valuePath={valuePath}
      />
    </FullContainer>
  );
};
