import React from 'react';

import map from 'lodash/map';
import some from 'lodash/some';

import { Flex, Collapse } from '@cognite/cogs.js';

import { Metadata } from './types';

type Props = {
  metadata: Metadata;
  selected: string;
  setSelected: React.Dispatch<React.SetStateAction<string>>;
  prefix: string;
  defaultActiveKey?: string;
};

export const ConfigFields: React.FC<Props> = ({
  prefix,
  selected,
  setSelected,
  metadata,
  defaultActiveKey,
}) => {
  const hasChildren = some(metadata, 'children');
  // @TODO(PP-678) refactor for better collapsible
  if (!hasChildren) {
    return null;
  }
  return (
    <Collapse
      defaultActiveKey={defaultActiveKey}
      accordion
      ghost
      onChange={(keys) => {
        setSelected(`${prefix}${keys}`);
      }}
    >
      {map(metadata, (datum, key) => {
        if (!datum.children) {
          return null;
        }
        return (
          <Collapse.Panel
            key={`${prefix}${key}`}
            className="cogs-detail strong"
            header={datum.label}
          >
            <Flex direction="column">
              <ConfigFields
                prefix={`${prefix}${key}.children.`}
                metadata={datum.children}
                selected={selected}
                setSelected={setSelected}
              />
            </Flex>
          </Collapse.Panel>
        );
      })}
    </Collapse>
  );
};
