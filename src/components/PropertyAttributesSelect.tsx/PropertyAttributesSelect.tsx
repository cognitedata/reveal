import { Menu, Icon, Dropdown, Flex } from '@cognite/cogs.js';
import { FieldDefinitionNode } from 'graphql';
import {
  isFieldRequired,
  doesFieldHaveDirective,
} from '../../utils/graphql-utils';
import { PropertyAttributesDisplay } from '../PropertyAttributesDisplay/PropertyAttributesDisplay';
import styled from 'styled-components/macro';

export const PropertyAttributesSelect = ({
  field,
}: {
  field: FieldDefinitionNode;
}) => {
  const isRequired = isFieldRequired(field.type);
  const isSearch = doesFieldHaveDirective(field, 'search');
  const isUnique = doesFieldHaveDirective(field, 'unique');
  const isIndexed = doesFieldHaveDirective(field, 'index');
  const PropertyAttributesSelectDropdown = (
    <Menu style={{ width: 180 }}>
      <Menu.Item appendIcon={isRequired ? 'Check' : undefined}>
        <Icon type="ExclamationMark" /> Required{' '}
      </Menu.Item>
      <Menu.Item appendIcon={isSearch ? 'Check' : undefined}>
        <Icon type="Search" /> Searchable
      </Menu.Item>
      <Menu.Item appendIcon={isUnique ? 'Check' : undefined}>
        <Icon type="Sun" /> Unique
      </Menu.Item>
      <Menu.Item appendIcon={isIndexed ? 'Check' : undefined}>
        <Icon type="DataTable" /> Indexed
      </Menu.Item>
    </Menu>
  );
  return (
    <Dropdown content={PropertyAttributesSelectDropdown}>
      <Container alignItems="center" gap={8}>
        <PropertyAttributesDisplay field={field} />
        <Icon type="Down" />
      </Container>
    </Dropdown>
  );
};

const Container = styled(Flex)`
  border-radius: 4px;
  padding: 4px;
  border: 2px solid var(--cogs-greyscale-grey4);
  display: inline-flex;
`;
