import {
  Group,
  MainDescription,
  MainTitle,
  Wrapper,
} from '@platypus-app/components/Styles/storybook';
import { ObjectTypeDefinitionNode } from 'graphql';

import { NodeWrapper } from '../SchemaVisualizer';
import { FullNode } from './FullNode';

export default {
  title: 'Schema/Schema Visualizer Node',
  component: FullNode,
};

const mockCustomType = {
  kind: 'ObjectTypeDefinition',
  name: {
    kind: 'Name',
    value: 'Comment',
  },
  description: {
    kind: 'StringValue',
    value: 'Description about Comment type',
  },
  directives: [],
  fields: [
    {
      kind: 'FieldDefinition',
      name: {
        kind: 'Name',
        value: 'id',
      },
      type: {
        kind: 'NamedType',
        name: {
          kind: 'Name',
          value: 'ID',
        },
      },
    },
    {
      kind: 'FieldDefinition',
      name: {
        kind: 'Name',
        value: 'body',
      },
      type: {
        kind: 'NamedType',
        name: {
          kind: 'Name',
          value: 'String',
        },
      },
    },
  ],
} as ObjectTypeDefinitionNode;

export const Default = ({
  item = mockCustomType,
}: {
  item: ObjectTypeDefinitionNode;
}) => {
  return (
    <Wrapper>
      <MainTitle>FullNode</MainTitle>
      <MainDescription title="Where is it used?">
        Component used in the visualizer to render different types.
      </MainDescription>
      <Group>
        <div
          style={{
            height: '600px',
            background: '#fcfcfc',
            border: '1px solid #ccc',
          }}
        >
          <NodeWrapper
            isActive={false}
            width={240}
            id={'id'}
            key={'key'}
            title={'title'}
            style={{}}
          >
            <FullNode item={item} />
          </NodeWrapper>
        </div>
      </Group>
    </Wrapper>
  );
};

export const WithRequiredField = () => (
  <Default
    item={{
      ...mockCustomType,
      fields: [
        ...(mockCustomType.fields as any),
        {
          kind: 'FieldDefinition',
          name: {
            kind: 'Name',
            value: 'author',
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',

              name: {
                kind: 'Name',
                value: 'Author',
              },
            },
          },
        },
      ],
    }}
  />
);

export const WithListField = () => (
  <Default
    item={{
      ...mockCustomType,
      fields: [
        ...(mockCustomType.fields as any),
        {
          kind: 'FieldDefinition',
          name: {
            kind: 'Name',
            value: 'replies',
          },
          type: {
            kind: 'ListType',
            type: {
              kind: 'NonNullType',
              type: {
                kind: 'NamedType',

                name: {
                  kind: 'Name',
                  value: 'Comment',
                },
              },
            },
          },
        },
      ],
    }}
  />
);

export const WithTypeDirective = () => (
  <Default
    item={{
      ...mockCustomType,
      directives: [
        {
          kind: 'Directive',
          name: {
            kind: 'Name',
            value: 'view',
          },
        },
      ],
    }}
  />
);

export const WithFieldDirectives = () => (
  <Default
    item={{
      ...mockCustomType,
      fields: [
        ...(mockCustomType.fields as any),
        {
          kind: 'FieldDefinition',
          name: {
            kind: 'Name',
            value: 'author',
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',

              name: {
                kind: 'Name',
                value: 'Author',
              },
            },
          },
          directives: [
            {
              kind: 'Directive',
              name: {
                kind: 'Name',
                value: 'filterable',
              },
            },
            {
              kind: 'Directive',
              name: {
                kind: 'Name',
                value: 'searchable',
              },
            },
          ],
        },
      ],
    }}
  />
);
