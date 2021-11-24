import * as React from 'react';
import { useLocation, useHistory } from 'react-router-dom';

import get from 'lodash/get';
import head from 'lodash/head';

import { ProjectConfig } from '@cognite/discover-api-types';

import { FullContainer } from './elements';
import { RightPanel, LeftPanel } from './layout';
import {
  HandleConfigChange,
  HandleConfigUpdate,
  Metadata,
  CustomComponent,
} from './types';

export interface Props {
  config: ProjectConfig;
  onChange: HandleConfigChange;
  onUpdate: HandleConfigUpdate;
  onReset: () => void;
  hasChanges: boolean;
  metadata: Metadata;
  renderCustomComponent: CustomComponent;
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
  renderCustomComponent,
}) => {
  const history = useHistory();
  const { search } = useLocation();
  const urlParams = React.useMemo(() => new URLSearchParams(search), [search]);

  React.useEffect(() => {
    if (!search) {
      history.push({ search: `?selectedPath=${head(Object.keys(metadata))}` });
    }
  }, [metadata, search]);

  const selectedPath: string = urlParams.get('selectedPath') || '';

  const setSelectedPath = (path: string) => {
    history.push({ search: `?selectedPath=${path}` });
  };

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
        metadataValue={selectedMetadata}
        onChange={onChange}
        onUpdate={onUpdate}
        onReset={onReset}
        hasChanges={hasChanges}
        value={get(config, valuePath)}
        valuePath={valuePath}
        metadataPath={metadataPath}
        renderCustomComponent={renderCustomComponent}
      />
    </FullContainer>
  );
};
