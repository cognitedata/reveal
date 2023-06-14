import React, { useState } from 'react';

import { Button, Dropdown, Menu } from '@cognite/cogs.js';

import { useTranslation } from '@extraction-pipelines/common';
import { MQTTSourceWithJobMetrics } from '@extraction-pipelines/hooks/hostedExtractors';
import { EditSourceDetailsModal } from '@extraction-pipelines/components/edit-source-details-modal/EditSourceDetailsModal';
import DeleteSourceModal from '@extraction-pipelines/components/delete-source-modal/DeleteSourceModal';

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
