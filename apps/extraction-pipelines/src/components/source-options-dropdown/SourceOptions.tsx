import React, { useState } from 'react';

import { Button, Dropdown, Menu } from '@cognite/cogs.js';
import styled from 'styled-components';

import { useTranslation } from 'common';
import { MQTTSourceWithJobMetrics } from 'hooks/hostedExtractors';
import { EditSourceDetailsModal } from 'components/edit-source-details-modal/EditSourceDetailsModal';
import DeleteSourceModal from 'components/delete-source-modal/DeleteSourceModal';

type TopicFilterProps = {
  source: MQTTSourceWithJobMetrics;
};

export const SourceOptions = ({ source }: TopicFilterProps): JSX.Element => {
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <StyledDropdown
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
      </StyledDropdown>

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

const StyledDropdown = styled(Dropdown)`
  .cogs-dropdown__content {
    overflow: auto;
  }
  z-index: 100000;
`;
