import { Body, Button, Title, Flex } from '@cognite/cogs.js';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { useDataModelState } from '@platypus-app/modules/solution/hooks/useDataModelState';
import { DataModelTypeDefsType } from '@platypus/platypus-core';
import { useState } from 'react';
import styled from 'styled-components';

import { EllipsisMenu } from './EllipsisMenu';
import { TypeDeleteModal } from './TypeDeleteModal';
import { TypeFormModal } from './TypeFormModal';

type Props = {
  disabled?: boolean;
  objectTypes: DataModelTypeDefsType[];
  createSchemaType: (schema: string) => void;
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
  const { t } = useTranslation('schema_type_list');

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

  const formModalOkMethod = (newTypeName: string) => {
    if (currentModal === 'create') {
      createSchemaType(newTypeName);
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
        <Title level={5} style={{ paddingLeft: 16, marginTop: 24 }}>
          {t('type_title', 'Types')}
        </Title>
      </Header>
      {objectTypes.length > 0 ? (
        <>
          {objectTypes.map((el) => (
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
                {el.directives?.map((directive) => (
                  <Tag key={directive.name}>{directive.name}</Tag>
                ))}
                <div style={{ padding: 2 }}>
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
                </div>
              </Flex>
            </ListItem>
          ))}
          {!disabled && (
            <Button
              icon="Add"
              iconPlacement="left"
              type="ghost"
              aria-label="Add type"
              data-cy="add-type-btn"
              disabled={disabled}
              style={{
                marginLeft: '8px',
                marginTop: '16px',
                padding: '4px 8px 4px 8px',
              }}
              onClick={openCreateModal}
            >
              {t('add_type', 'Add Type')}
            </Button>
          )}
        </>
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
  color: #2b3a88;
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
