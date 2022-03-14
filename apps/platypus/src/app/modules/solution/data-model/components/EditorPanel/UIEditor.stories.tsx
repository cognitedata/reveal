import {
  Group,
  MainDescription,
  MainTitle,
  Wrapper,
} from '@platypus-app/components/Styles/storybook';
import { mockComplexGraphqlModel } from '@platypus-app/mocks/graphqlModels';
import { useState } from 'react';
import { UIEditor } from './UIEditor';

export default {
  title: 'Schema/UIEditor',
  component: UIEditor,
};

export const Default = () => {
  const [schema, setSchema] = useState<string>(mockComplexGraphqlModel);

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
          <UIEditor graphQLSchemaString={schema} onSchemaChange={setSchema} />
        </div>
      </Group>
    </Wrapper>
  );
};
