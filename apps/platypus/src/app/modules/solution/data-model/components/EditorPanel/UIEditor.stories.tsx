import {
  Group,
  MainDescription,
  MainTitle,
  Wrapper,
} from '@platypus-app/components/Styles/storybook';
import { mockComplexGraphqlModel } from '@platypus-app/mocks/graphqlModels';
import { SolutionDataModelType } from '@platypus/platypus-core';
import { useState } from 'react';
import { UIEditor } from './UIEditor';

export default {
  title: 'Schema/UIEditor',
  component: UIEditor,
};

export const Default = () => {
  const [schema, setSchema] = useState<string>(mockComplexGraphqlModel);
  const [currentType, setCurrentType] = useState<null | SolutionDataModelType>(
    null
  );
  return (
    <Wrapper>
      <MainTitle>UIEditor</MainTitle>
      <MainDescription title="Where is it used?">
        Component for Creating data model without writing code.
        <br />
        This component is used on Solution/Data Model page.
      </MainDescription>
      <Group>
        <div style={{ height: '600px' }}>
          <UIEditor
            graphQLSchemaString={schema}
            onSchemaChange={setSchema}
            currentType={currentType}
            setCurrentType={setCurrentType}
          />
        </div>
      </Group>
    </Wrapper>
  );
};
