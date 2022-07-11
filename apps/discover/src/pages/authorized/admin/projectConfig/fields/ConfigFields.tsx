import React from 'react';

import classNames from 'classnames';
import get from 'lodash/get';
import map from 'lodash/map';

import { Flex, Collapse, Body } from '@cognite/cogs.js';
import { ProjectConfig } from '@cognite/discover-api-types';

import { Metadata } from '../../../../../domain/projectConfig/types';
import { ExpandIcon } from '../common/ExpandIcon';
import { ConfigIcon, CollapseWrapper, LeafField } from '../elements';
import { MetadataValue } from '../types';
import { getMetadataFromValue } from '../utils/getMetadataFromValue';
import { isLeaf } from '../utils/isLeaf';

type Props = {
  metadata?: Metadata;
  selected: string;
  setSelected: (path: string) => void;
  prefixPath: string;
  config?: ProjectConfig;
};
export const ConfigFields: React.FC<Props> = ({
  prefixPath,
  selected,
  setSelected,
  metadata,
  config,
}) => {
  return (
    <>
      {map(metadata, (currentMetadata, path) => {
        if (!(currentMetadata.children || currentMetadata.dataAsChildren)) {
          return null;
        }
        const currentPath = `${prefixPath}${path}`;

        const isCurrentPathActive = selected.indexOf(currentPath) === 0;

        const currentMetadataIsLeaf = isLeaf(currentMetadata);

        if (currentMetadataIsLeaf) {
          return (
            <LeafField
              key={currentPath}
              className={classNames({
                'config-item-active': isCurrentPathActive,
              })}
              onClick={() => setSelected(currentPath)}
            >
              <ConfigIcon type="Minus" active="true" />
              <Body level={2} strong>
                {currentMetadata.label}
              </Body>
            </LeafField>
          );
        }

        return (
          <NestedField
            key={currentPath}
            currentPath={currentPath}
            currentMetadata={currentMetadata}
            config={config}
            selected={selected}
            setSelected={setSelected}
            isCurrentPathActive={isCurrentPathActive}
          />
        );
      })}
    </>
  );
};

// this is called recursively from the above ConfigFields component
// so best to keep it located closely here
const NestedField: React.FC<{
  currentPath: string;
  currentMetadata: MetadataValue;
  config?: ProjectConfig;
  selected: Props['selected'];
  setSelected: Props['setSelected'];
  isCurrentPathActive: boolean;
}> = ({
  currentPath,
  currentMetadata,
  config,
  selected,
  setSelected,
  isCurrentPathActive,
}) => {
  const handleCollapseChange = React.useCallback(
    (newPath) => {
      if (!newPath) {
        setSelected(currentPath);
      } else {
        setSelected(newPath);
      }
    },
    [currentPath, setSelected]
  );

  const childrenMetadata = currentMetadata.dataAsChildren
    ? getMetadataFromValue(get(config, currentPath), currentMetadata)
    : currentMetadata.children;

  return (
    <CollapseWrapper key={currentPath} data-testid="project-config-category">
      <Collapse
        activeKey={isCurrentPathActive ? currentPath : selected}
        expandIcon={ExpandIcon}
        className="config-field-item"
        accordion
        ghost
        onChange={handleCollapseChange}
      >
        <Collapse.Panel
          key={currentPath}
          headerClass={classNames({
            'config-item-active': currentPath === selected,
          })}
          header={
            <Body level={2} strong>
              {currentMetadata.label}
            </Body>
          }
        >
          <Flex direction="column" data-testid="collapse-content">
            <ConfigFields
              prefixPath={`${currentPath}.`}
              metadata={childrenMetadata}
              selected={selected}
              setSelected={setSelected}
              config={config}
            />
          </Flex>
        </Collapse.Panel>
      </Collapse>
    </CollapseWrapper>
  );
};
