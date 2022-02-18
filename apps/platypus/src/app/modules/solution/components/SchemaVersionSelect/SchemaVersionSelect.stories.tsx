import { useState } from 'react';
import {
  Wrapper,
  MainTitle,
  MainDescription,
  GroupTitle,
  Group,
} from '../../../../components/Styles/storybook';

import { SchemaVersionSelect } from './SchemaVersionSelect';
import { StyledSelectContainer } from './elements';

export default {
  title: 'Schema/SchemaVersionSelect',
  component: SchemaVersionSelect,
};

const SelectOptions = ['3.2', '3.1', '3.0', '2.1', '2.0', '1.2', '1.1', '1.0'];

export const Base = () => {
  return (
    <>
      <Wrapper>
        <MainTitle>Select </MainTitle>
        <MainDescription title="Where is it used?">
          On the Overview page for a solution.
        </MainDescription>
        <Group>
          <GroupTitle>Simple version selector</GroupTitle>
          <StyledSelectContainer>
            <BasicSchemaVersionSelect />
          </StyledSelectContainer>
          {/* <StyledResult>
            Selected version is <strong>{version}</strong>
          </StyledResult> */}
        </Group>
      </Wrapper>
    </>
  );
};

export const BasicSchemaVersionSelect = () => {
  const [version, setVersion] = useState(SelectOptions[0]);
  return (
    <SchemaVersionSelect
      selectedVersion={version}
      versions={SelectOptions}
      onChange={(seletedValue) => {
        setVersion(seletedValue);
      }}
    />
  );
};
