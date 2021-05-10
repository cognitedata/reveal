import React from 'react';
import { SingleCogniteCapability } from '@cognite/sdk';
import { Tag } from 'antd';
import { getCapabilityName } from './utils';

type Props = {
  capability: SingleCogniteCapability;
};
export default function CapabilityTag({ capability }: Props) {
  const acl: string = Object.keys(capability)[0]!;
  // @ts-ignore
  const { actions = [], scope } = capability[acl];
  const scopeLabel = Object.keys(scope || {})[0]?.replace('Scope', '');

  return actions.map((a: string) => (
    <Tag key={`${acl.replace('Acl', '')}:${a.toLowerCase()}`}>
      {scopeLabel !== 'all' && (
        <span
          style={{
            backgroundColor: 'var(--cogs-primary)',
            color: 'white',
            padding: '0 4px',
            borderRadius: 2,
          }}
        >
          Scope: {scopeLabel}
        </span>
      )}
      {getCapabilityName(capability)}:{`${a.toLowerCase()}`}
    </Tag>
  ));
}
