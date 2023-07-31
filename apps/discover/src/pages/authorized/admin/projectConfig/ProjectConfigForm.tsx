import * as React from 'react';

import { Map } from 'immutable';
import get from 'lodash/get';

import { ProjectConfig } from '@cognite/discover-api-types';

import { Metadata } from '../../../../domain/projectConfig/types';

import { FullContainer } from './elements';
import { useSelectedPath } from './hooks/useSelectedPath';
import { RightPanel, LeftPanel } from './layout';
import {
  HandleConfigChange,
  HandleConfigUpdate,
  CustomComponentProps,
  CustomDeleteProps,
} from './types';
import { adaptSelectedPathToMetadataPath } from './utils/adaptSelectedPathToMetadataPath';
import { getArrayChangeDetail } from './utils/getArrayChangeDetail';

export interface Props {
  config: ProjectConfig;
  onChange: HandleConfigChange;
  onUpdate: HandleConfigUpdate;
  onReset: () => void;
  hasChanges: boolean;
  metadata: Metadata;
  renderCustomComponent: React.FC<
    React.PropsWithChildren<CustomComponentProps>
  >;
  renderDeleteComponent: React.FC<React.PropsWithChildren<CustomDeleteProps>>;
}

export const ProjectConfigForm: React.FC<Props> = ({
  onChange,
  onUpdate,
  onReset,
  hasChanges,
  config,
  metadata,
  renderCustomComponent,
  renderDeleteComponent,
}) => {
  const { selectedPath, setSelectedPath } = useSelectedPath(metadata);
  const shouldUpdate = React.useRef<boolean>(false);

  const metadataPath = React.useMemo(
    () => adaptSelectedPathToMetadataPath(selectedPath),
    [selectedPath]
  );
  const selectedMetadata = get(metadata, metadataPath);
  const valuePath = selectedPath;

  const { hasArrayChange, arrayChangePath } = React.useMemo<{
    hasArrayChange: boolean;
    arrayChangePath: string;
  }>(
    () => getArrayChangeDetail(selectedPath, metadata),
    [metadata, selectedPath]
  );

  const handleChange = React.useCallback(
    (key: string, value: unknown) => {
      if (hasArrayChange) {
        onChange(
          arrayChangePath,
          get(Map(config).setIn(key.split('.'), value).toJS(), arrayChangePath)
        );
      } else {
        onChange(key, value);
      }
    },
    [onChange, hasArrayChange, arrayChangePath, selectedPath, config]
  );

  const handleChangeAndUpdate = React.useCallback(
    (key: string, value: unknown) => {
      shouldUpdate.current = true;
      handleChange(key, value);
    },
    [handleChange]
  );

  React.useEffect(() => {
    if (shouldUpdate.current) {
      shouldUpdate.current = false;
      onUpdate();
    }
  }, [config, onUpdate]);

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
        onChange={handleChange}
        onChangeAndUpdate={handleChangeAndUpdate}
        onUpdate={onUpdate}
        onReset={onReset}
        hasChanges={hasChanges}
        values={get(config, valuePath)}
        valuePath={valuePath}
        metadataPath={metadataPath}
        renderCustomComponent={renderCustomComponent}
        renderDeleteComponent={renderDeleteComponent}
      />
    </FullContainer>
  );
};
