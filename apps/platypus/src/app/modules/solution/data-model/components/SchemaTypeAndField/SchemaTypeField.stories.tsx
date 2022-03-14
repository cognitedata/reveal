import {
  Group,
  MainDescription,
  MainTitle,
  Wrapper,
} from '@platypus-app/components/Styles/storybook';
import { SolutionDataModelField } from '@platypus/platypus-core';
import { useState } from 'react';
import { SchemaTypeField } from './SchemaTypeField';

export default {
  title: 'Schema/UIEditor/SchemaTypeField',
  component: SchemaTypeField,
};

export const Default = () => {
  const [field, setField] = useState<SolutionDataModelField>({
    name: 'test',
    type: {
      name: 'String',
      list: false,
    },
  } as SolutionDataModelField);

  return (
    <Wrapper>
      <MainTitle>SchemaTypeField</MainTitle>
      <MainDescription title="Where is it used?">
        Component for creating Data Model field.
        <br />
        This component is used in the UI editor on Solution/Data Model page.
      </MainDescription>
      <Group>
        <div style={{ height: '600px' }}>
          <SchemaTypeField
            field={field}
            customTypesNames={['Post']}
            typeFieldNames={['Post']}
            onFieldRemoved={(updatedField) =>
              console.log('removed', updatedField)
            }
            onFieldUpdated={(updatedField) => {
              setField({
                ...field,
                ...(updatedField as SolutionDataModelField),
              });
            }}
          />
        </div>
      </Group>
    </Wrapper>
  );
};
