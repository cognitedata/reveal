import styled from 'styled-components';

import { useTranslation } from '@transformations/common';
import Collapse from '@transformations/components/collapse';
import { Alert } from 'antd';

import { Body } from '@cognite/cogs.js';

import DeleteModal from './DeleteModal';

export type DeleteTransformationModalProps = {
  handleClose: () => void;
  handleDelete: () => void;
  isEmpty?: boolean;
  items: { id: number | string; name: string }[];
  visible: boolean;
  loading: boolean;
};

const DeleteTransformationModal = ({
  handleClose,
  handleDelete,
  items,
  isEmpty = false,
  visible,
  loading,
}: DeleteTransformationModalProps) => {
  const { t } = useTranslation();

  return (
    <DeleteModal
      bodyText={t('transformation-delete-modal-body', {
        count: items.length,
        name: items[0] ? items[0].name : '',
      })}
      checkboxLabel={t('transformation-delete-modal-checkbox-label', {
        count: items.length,
      })}
      extraContent={
        <>
          {items.length > 5 && (
            <Collapse
              title={t('n-transformations', { count: items.length })}
              type="danger"
            >
              <StyledErrorList>
                {items.map((row) => (
                  <li key={row.id}>
                    <Body level="3">{row.name}</Body>
                  </li>
                ))}
              </StyledErrorList>
            </Collapse>
          )}
          {items.length < 5 && items.length > 1 && (
            <Alert
              type="error"
              message={
                <StyledErrorList>
                  {items.map((row) => (
                    <li key={row.id}>
                      <Body level="3">{row.name}</Body>
                    </li>
                  ))}
                </StyledErrorList>
              }
            />
          )}
        </>
      }
      visible={visible}
      onCancel={handleClose}
      onOk={handleDelete}
      items={items}
      withCheckbox={items.length !== 1 || !isEmpty}
      cancelText={t('transformation-delete-modal-button-cancel')}
      loading={loading}
      okText={t(
        loading
          ? 'transformation-delete-modal-button-deleting'
          : 'transformation-delete-modal-button-delete',
        { count: items.length }
      )}
    />
  );
};

const StyledErrorList = styled.ul`
  margin: 0;
  padding-left: 22px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export default DeleteTransformationModal;
