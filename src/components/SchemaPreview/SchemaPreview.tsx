import { ObjectTypeDefinitionNode, parse } from 'graphql';
import { useMemo } from 'react';
import { Body, Collapse, CollapsePanelProps, Icon, Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import { SchemaTypePreview } from '../SchemaTypePreview/SchemaTypePreview';

export const SchemaPreview = ({
  graphQLSchemaString,
}: {
  graphQLSchemaString: string;
}) => {
  const schemaTypes = useMemo(
    () => parse(graphQLSchemaString as string).definitions
    .filter(definition =>
      definition.kind === 'ObjectTypeDefinition' ||
      definition.kind === 'InterfaceTypeDefinition'
    ),
    [graphQLSchemaString]
  ) as ObjectTypeDefinitionNode[];

  const expandIcon = ({ isActive }: CollapsePanelProps) => (
    <StyledExpandIcon>
      <Icon type={isActive ? 'ChevronUpMicro' : 'ChevronDownMicro'} />
    </StyledExpandIcon>
  );

  return (
    <Wrapper>
      {schemaTypes.map((schemaType: ObjectTypeDefinitionNode) => (
        <Collapse ghost expandIcon={expandIcon} defaultActiveKey={schemaType.name.value}>
          <StyledCollapsePanel
            header={
              <StyledHeaderWrapper>
                <Title level={5}>{schemaType.name.value}</Title>
                <Body level={2}>
                  {schemaType.description?.value ? `[${schemaType.description?.value}]` : ''}
                </Body>
              </StyledHeaderWrapper>
            }
            key={schemaType.name.value}
          >
            <SchemaTypePreview schemaName={schemaType.name.value} graphQLSchemaString={graphQLSchemaString}/>
          </StyledCollapsePanel>
        </Collapse>
      ))}
    </Wrapper>
  )
};


const Wrapper = styled.div`
  .cogs-collapse {
    margin-top: 20px;
  }
`;

const StyledExpandIcon = styled.div`
  position: absolute;
  display: flex;
  justify-content: center;
  margin-left: 93%;
  width: 20px;
  height: 20px;
  border: 1.5px solid var(--cogs-text-color-secondary);
  border-radius: 50%;

  .cogs-icon {
    color: var(--cogs-text-color-secondary);
  }
`;

const StyledCollapsePanel = styled(Collapse.Panel)`
  .rc-collapse-content {
    padding: 0;
    max-height: 203px;
    overflow: scroll;
  }
`;

const StyledHeaderWrapper = styled.div`
  display: flex;

  .cogs-title-5, .cogs-body-2 {
    color: var(--cogs-text-color-secondary);
  }

  .cogs-title-5 {
    margin-right: 15px;
  }
`;
