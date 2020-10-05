import React from 'react';
import styled from 'styled-components';
import { Button } from '@cognite/cogs.js';
import '@cognite/cogs.js/dist/antd.css';
import '@cognite/cogs.js/dist/cogs.css';
import { Sequence } from '@cognite/sdk';
import { ResourceSelectionProvider } from 'context/ResourceSelectionContext';
import { SequenceDetailsAbstract } from './SequenceDetailsAbstract';

const sequence = ({
  id: 18829367093500,
  name: 'LubeOil_65-CT-510',
  externalId: 'LubeOil_65-CT-510',
  metadata: {},
  columns: [
    {
      externalId: 'Oil_unit_description',
      description: 'Unit',
      valueType: 'STRING',
      metadata: {},
      createdTime: new Date(),
      lastUpdatedTime: new Date(),
    },
    {
      externalId: 'Oil_sampling_point',
      valueType: 'STRING',
      metadata: {},
      createdTime: new Date(),
      lastUpdatedTime: new Date(),
    },
    {
      externalId: 'Oil_ressursnummer',
      valueType: 'STRING',
      metadata: {},
      createdTime: new Date(),
      lastUpdatedTime: new Date(),
    },
    {
      externalId: 'Oil_qty',
      valueType: 'STRING',
      metadata: {},
      createdTime: new Date(),
      lastUpdatedTime: new Date(),
    },
    {
      externalId: 'Oil_type',
      valueType: 'STRING',
      metadata: {},
      createdTime: new Date(),
      lastUpdatedTime: new Date(),
    },
    {
      externalId: 'Oil_comments',
      valueType: 'STRING',
      metadata: {},
      createdTime: new Date(),
      lastUpdatedTime: new Date(),
    },
    {
      externalId: 'Oil_change_frequence',
      valueType: 'STRING',
      metadata: {},
      createdTime: new Date(),
      lastUpdatedTime: new Date(),
    },
    {
      externalId: 'Oil_annual_consumption',
      valueType: 'STRING',
      metadata: {},
      createdTime: new Date(),
      lastUpdatedTime: new Date(),
    },
  ],
  createdTime: new Date(),
  lastUpdatedTime: new Date(),
} as unknown) as Sequence;

export default {
  title: 'Organisms/SequenceDetailsAbstract',
  component: SequenceDetailsAbstract,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};

export const Example = () => {
  return <SequenceDetailsAbstract sequence={sequence} />;
};

export const WithActions = () => {
  return (
    <SequenceDetailsAbstract
      sequence={sequence}
      actions={[
        <Button type="primary">Click me</Button>,
        <Button>Click me too</Button>,
      ]}
    />
  );
};
export const WithExtras = () => {
  return (
    <SequenceDetailsAbstract
      sequence={sequence}
      extras={
        <Button
          type="primary"
          variant="ghost"
          shape="round"
          icon="VerticalEllipsis"
        />
      }
    />
  );
};

const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <ResourceSelectionProvider>
      <Wrapper>{children}</Wrapper>
    </ResourceSelectionProvider>
  );
};

const Wrapper = styled.div`
  padding: 20px;
  width: 400px;
  background: grey;
  display: flex;
  justify-content: center;
  align-items: center;

  && > * {
    background: #fff;
  }
`;
