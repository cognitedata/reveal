import {
  Group,
  MainDescription,
  MainTitle,
  Wrapper,
} from '@platypus-app/components/Styles/storybook';
import { SolutionSchema } from '@platypus/platypus-core';
import { useState } from 'react';
import { SchemaVersionDropdown } from './SchemaVersionDropdown';

export default {
  title: 'Schema/SchemaVersionDropdown',
  component: SchemaVersionDropdown,
};
const date = new Date();
const schemaVersions = [
  {
    schema: '',
    externalId: '',
    status: 'DRAFT',
    version: '2',
    createdTime: Date.now(),
    lastUpdatedTime: Date.now(),
  },
  {
    schema: '',
    externalId: '',
    status: 'PUBLISHED',
    version: '2',
    createdTime: date.setDate(date.getDate() - 1),
    lastUpdatedTime: date.setDate(date.getDate() - 1),
  },
  {
    schema: '',
    externalId: '',
    status: 'PUBLISHED',
    version: '1',
    createdTime: date.setDate(date.getDate() - 2),
    lastUpdatedTime: date.setDate(date.getDate() - 2),
  },
] as SolutionSchema[];

export const Default = () => {
  const [version, setVersion] = useState(schemaVersions[1]);
  return (
    <Wrapper>
      <MainTitle>SchemaVersionDropdown</MainTitle>
      <MainDescription title="Where is it used?">
        Component for selecting version of schema.
        <br />
        This component is used in the header of Solution/Data Model page &
        Overview page.
      </MainDescription>
      <Group>
        <div style={{ height: '600px' }}>
          <SchemaVersionDropdown
            selectedVersion={version}
            versions={schemaVersions}
            onVersionSelect={(v) => setVersion(v)}
          />
        </div>
      </Group>
    </Wrapper>
  );
};
