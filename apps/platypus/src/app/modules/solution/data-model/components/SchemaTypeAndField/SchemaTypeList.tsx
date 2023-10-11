import { useMemo, useState } from 'react';

import styled from 'styled-components';

import { DataModelTypeDefsType } from '@platypus/platypus-core';

import { Body, Button, Title, Flex, Input } from '@cognite/cogs.js';

import { useDebounce } from '../../../../../hooks/useDebounce';
import { useTranslation } from '../../../../../hooks/useTranslation';
import { useDataModelState } from '../../../hooks/useDataModelState';

import { EllipsisMenu } from './EllipsisMenu';
import { TypeDeleteModal } from './TypeDeleteModal';
import { TypeFormModal } from './TypeFormModal';

type Props = {
  disabled?: boolean;
  objectTypes: DataModelTypeDefsType[];
  createSchemaType: (typeName: string, dataModelKind: string) => void;
  renameSchemaType: (oldTypeName: string, newTypeName: string) => void;
  deleteSchemaType: (typeName: string) => void;
};

type ModalType = 'create' | 'rename' | 'delete' | '';

export const SchemaTypeList = ({
  disabled,
  objectTypes,
  createSchemaType,
  renameSchemaType,
  deleteSchemaType,
}: Props) => {
  const [currentModal, setModal] = useState<ModalType>('');
  const { setCurrentTypeName } = useDataModelState();
  const [typeValue, setValue] = useState('');
  const [searchFilterValue, setSearchFilterValue] = useState('');
  const { t } = useTranslation('schema_type_list');

  const debouncedSearchValue = useDebounce(searchFilterValue, 300);

  const filteredTypes = useMemo(
    () =>
      (objectTypes || []).filter((type) =>
        type.name.toLowerCase().startsWith(debouncedSearchValue.toLowerCase())
      ),
    [objectTypes, debouncedSearchValue]
  );

  const closeModal = () => {
    setModal('');
  };
  const openCreateModal = () => {
    setModal('create');
    setValue('');
  };
  const openRenameModal = (value: string) => {
    setModal('rename');
    setValue(value);
  };
  const openDeleteModal = (value: string) => {
    setModal('delete');
    setValue(value);
  };

  const formModalOkMethod = (newTypeName: string, dataModelKind: string) => {
    if (currentModal === 'create') {
      createSchemaType(newTypeName, dataModelKind);
    }
    if (currentModal === 'rename') {
      renameSchemaType(typeValue, newTypeName);
    }
  };

  return (
    <>
      {(currentModal === 'create' || currentModal === 'rename') && (
        <TypeFormModal
          visible={currentModal === 'create' || currentModal === 'rename'}
          closeModal={closeModal}
          onOk={formModalOkMethod}
          mode={currentModal}
          typeValue={typeValue}
          existingTypes={objectTypes}
        />
      )}

      <TypeDeleteModal
        typeValue={typeValue}
        visible={currentModal === 'delete'}
        closeModal={closeModal}
        onOk={deleteSchemaType}
      />
      <Header>
        <Title data-cy="ui-editor-list-title" level={5}>
          {t('type_title', 'Types')}
        </Title>

        <Flex alignItems="center" gap={4}>
          {objectTypes.length ? (
            <Input
              iconPlacement="left"
              icon="Search"
              onChange={(e) => setSearchFilterValue(e.target.value)}
              placeholder="Search"
              value={searchFilterValue}
              type="search"
            />
          ) : null}

          {!disabled && (
            <Button
              icon="Add"
              iconPlacement="left"
              type="ghost"
              aria-label="Add type"
              data-cy="add-type-btn"
              disabled={disabled}
              style={{
                padding: '4px 8px 4px 8px',
              }}
              onClick={openCreateModal}
            >
              {t('add_type', 'Add Type')}
            </Button>
          )}
        </Flex>
      </Header>
      {filteredTypes.length > 0 ? (
        <div style={{ flexGrow: 1, overflow: 'auto' }}>
          {filteredTypes.map((el) => (
            <ListItem
              data-cy={`type-list-item-${el.name}`}
              key={el.name}
              onClick={() => setCurrentTypeName(el.name)}
            >
              <Flex direction="column">
                <Body level={2} strong>
                  {el.name}
                </Body>
                <Body level={3} style={{ color: 'rgba(0,0,0,.45)' }}>
                  {`${el.fields?.length} ${t('properties', 'properties')}`}
                </Body>
              </Flex>
              <Flex alignItems="center" gap={8}>
                {el.kind === 'interface' ? (
                  <Tag key={el.name}>interface</Tag>
                ) : null}
                {el.directives?.map((directive) => (
                  <Tag key={directive.name}>{directive.name}</Tag>
                ))}
                {!disabled && (
                  <EllipsisMenu
                    disabled={disabled}
                    typeName={el.name}
                    onRename={openRenameModal}
                    onDelete={openDeleteModal}
                  />
                )}
                <ChevronButton
                  type="ghost"
                  icon="ArrowRight"
                  style={{ paddingLeft: '5px', paddingRight: '5px' }}
                  aria-label="Forward"
                />
              </Flex>
            </ListItem>
          ))}
        </div>
      ) : (
        <Flex direction="column" justifyContent="center" alignItems="center">
          <EmptyText>
            {t('empty_text', 'There are currently no types.')}
          </EmptyText>
          {!disabled && (
            <Button
              icon="Add"
              iconPlacement="left"
              aria-label="Add type"
              disabled={disabled}
              onClick={openCreateModal}
              data-cy="no-types-add-type-btn"
            >
              {t('add_type', 'Add Type')}
            </Button>
          )}
        </Flex>
      )}
    </>
  );
};

const Header = styled.div`
  display: flex;
  margin-bottom: 12px;
  justify-content: space-between;
  padding: 24px 16px 0;
`;

const ListItem = styled.div`
  padding: 8px 12px 8px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  :hover {
    color: var(--cogs-greyscale-grey7);
    cursor: pointer;
    border-radius: 6px;
    background: rgba(34, 42, 83, 0.06);
  }
  & button:disabled {
    background: none;
  }
`;

const ChevronButton = styled(Button)`
  ${ListItem}:hover & {
    color: #333333;
    background: none;
  }
`;

const Tag = styled.span`
  padding: 2px 6px;
  background: rgba(110, 133, 252, 0.12);
  color: var(--cogs-midblue-1);
  border-radius: 4px;
  font-weight: 500;
  font-size: 12px;
  text-transform: capitalize;
  line-height: 16px;
`;

const EmptyText = styled(Body)`
  margin-top: 100px;
  margin-bottom: 16px;
  font-size: 14px;
  line-height: 20px;
  font-style: italic;
  color: rgba(0, 0, 0, 0.45);
`;
