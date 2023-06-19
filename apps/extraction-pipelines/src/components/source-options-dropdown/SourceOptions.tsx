import React, { useState } from 'react';

import { Button, Dropdown, Menu } from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import { MQTTSourceWithJobMetrics } from '../../hooks/hostedExtractors';
import DeleteSourceModal from '../delete-source-modal/DeleteSourceModal';
import { EditSourceDetailsModal } from '../edit-source-details-modal/EditSourceDetailsModal';

type SourceOptionProps = {
  source: MQTTSourceWithJobMetrics;
};

export const SourceOptions = ({ source }: SourceOptionProps): JSX.Element => {
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <Dropdown
        content={
          <Menu>
            <Menu.Item
              icon="Edit"
              iconPlacement="left"
              onClick={() => setOpenEditModal(true)}
            >
              {t('edit')}
            </Menu.Item>
            <Menu.Item
              destructive
              icon="Delete"
              iconPlacement="left"
              onClick={() => setOpenDeleteModal(true)}
            >
              {t('delete')}
            </Menu.Item>
          </Menu>
        }
        hideOnSelect={{
          hideOnContentClick: true,
          hideOnOutsideClick: true,
        }}
      >
        <Button icon="EllipsisHorizontal" type="ghost" />
      </Dropdown>

      {openDeleteModal && (
        <DeleteSourceModal
          onCancel={() => setOpenDeleteModal(false)}
          source={source}
          visible={openDeleteModal}
        />
      )}
      {openEditModal && (
        <EditSourceDetailsModal
          onCancel={() => setOpenEditModal(false)}
          source={source}
          visible={openEditModal}
        />
      )}
    </>
  );
};
