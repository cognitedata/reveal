import { Menu, Icon, Dropdown, Flex } from '@cognite/cogs.js';
import styled from 'styled-components/macro';
import { doesFieldHaveDirective } from '@platypus-app/utils/graphql-utils';
import { FieldDirectiveDisplay } from './FieldDirectiveDisplay';
import {
  SolutionDataModelField,
  SolutionDataModelFieldType,
  BuiltInType,
  DirectiveBuiltInType,
  DirectiveProps,
} from '@platypus/platypus-core';
import { DropdownItem } from './DropdownItem';
import { FieldSchemaDirectiveType } from '../../types';

type Props = {
  field: SolutionDataModelField;
  onSelect: (directiveName: string) => void;
  disabled: boolean;
  builtInTypes: BuiltInType[];
};

function shouldDisableDirective(
  name: string,
  fieldType: SolutionDataModelFieldType,
  builtIns: BuiltInType[]
) {
  if (name === 'searchable') {
    return fieldType.name !== 'String';
  }
  if (name === 'filterable') {
    return (
      fieldType.list || !builtIns.some((type) => type.name === fieldType.name)
    );
  }
  return true;
}
function mergeDirectivePropsWithFieldProps(
  directiveProps: DirectiveProps[],
  fieldProps: FieldSchemaDirectiveType[]
) {
  return directiveProps.map((directive) => {
    const commonDirective = fieldProps.find(
      (fieldDirective) => fieldDirective.name === directive.name
    );
    return { ...directive, ...commonDirective };
  });
}
export const FieldDirectiveSelect = ({
  field,
  onSelect,
  disabled,
  builtInTypes,
}: Props) => {
  const fieldDirectives = builtInTypes.filter(
    (builtin) =>
      builtin.type === 'DIRECTIVE' &&
      (builtin as DirectiveBuiltInType).fieldDirective
  ) as FieldSchemaDirectiveType[];
  const getChecked = (name: string) =>
    doesFieldHaveDirective(field.directives || [], name);
  const DropdownContent = (
    <Menu style={{ width: 170 }}>
      {fieldDirectives.map((directive) => {
        return (
          <DropdownItem
            key={directive.name}
            disabled={shouldDisableDirective(
              directive.name,
              field.type,
              builtInTypes
            )}
            name={directive.name}
            iconName={directive.icon}
            onItemClick={onSelect}
            getChecked={getChecked}
          />
        );
      })}
    </Menu>
  );
  const mergedDirectives = mergeDirectivePropsWithFieldProps(
    field.directives || [],
    fieldDirectives
  ) as FieldSchemaDirectiveType[];
  return (
    <Dropdown content={DropdownContent} disabled={disabled || field.type.list}>
      <Container alignItems="center" gap={8}>
        <FieldDirectiveDisplay directives={mergedDirectives} />
        {disabled || field.type.list ? null : <Icon type="ChevronDown" />}
      </Container>
    </Dropdown>
  );
};

const Container = styled(Flex)`
  width: 120px;
  border-radius: 6px;
  padding: 4px;
  border: 2px solid var(--cogs-greyscale-grey4);
  display: inline-flex;
  justify-content: space-between;
`;
