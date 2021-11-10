import React from 'react';

import classNames from 'classnames';
import get from 'lodash/get';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import some from 'lodash/some';

import { Flex, Collapse, Body, CollapsePanelProps } from '@cognite/cogs.js';
import { ProjectConfig } from '@cognite/discover-api-types';

import { ConfigIcon, CollapseWrapper, LeafField } from './elements';
import { Metadata, MetadataValue } from './types';

type Props = {
  metadata?: Metadata;
  selected: string;
  setSelected: React.Dispatch<React.SetStateAction<string>>;
  prefixPath: string;
  config?: ProjectConfig;
};

const expandIcon = ({ isActive }: CollapsePanelProps) => {
  return <ConfigIcon type="ChevronDownMicro" active={`${isActive}`} />;
};

const getMetadataFromValue = (
  value: ProjectConfig[keyof ProjectConfig],
  currentMetadata: MetadataValue
): Metadata => {
  return reduce<ProjectConfig[keyof ProjectConfig], Metadata>(
    value as [],
    (acc, datum, index) => {
      const accumulator = { ...acc };
      accumulator[index] = {
        label:
          get(datum, currentMetadata?.dataLabelIdentifier || '') ??
          `${currentMetadata.label} ${index + 1}`,
        children: currentMetadata.children,
      };
      return accumulator;
    },
    {}
  );
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

        const isLeaf =
          !some(currentMetadata.children, 'children') &&
          !currentMetadata.dataAsChildren;

        if (isLeaf) {
          return (
            <LeafField
              key={currentPath}
              className={classNames({
                'config-item-active': isCurrentPathActive,
              })}
              onClick={() => setSelected(currentPath)}
            >
              <ConfigIcon type="Dot" active="true" />
              <Body level={2} strong>
                {currentMetadata.label}
              </Body>
            </LeafField>
          );
        }

        const handleCollapseChange = React.useCallback((newPath) => {
          if (!newPath) {
            setSelected(currentPath);
          } else {
            setSelected((existingPath) => {
              if (newPath) return newPath;
              return existingPath;
            });
          }
        }, []);

        const childrenMetadata = currentMetadata.dataAsChildren
          ? getMetadataFromValue(get(config, currentPath), currentMetadata)
          : currentMetadata.children;

        return (
          <CollapseWrapper key={currentPath}>
            <Collapse
              activeKey={isCurrentPathActive ? currentPath : selected}
              expandIcon={expandIcon}
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
                <Flex direction="column">
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
      })}
    </>
  );
};
