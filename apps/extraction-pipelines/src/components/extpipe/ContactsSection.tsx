import React, { FunctionComponent, useState } from 'react';

import styled from 'styled-components';

import { useTranslation } from '@extraction-pipelines/common';
import {
  ContactsDialog,
  isOwnerRole,
} from '@extraction-pipelines/components/extpipe/ContactsDialog';
import Section from '@extraction-pipelines/components/section';
import { useSelectedExtpipe } from '@extraction-pipelines/hooks/useExtpipe';

import { Button, Flex, Icon, Chip, Modal } from '@cognite/cogs.js';

interface ContactsViewProps {
  canEdit: boolean;
}

export const ContactsSection: FunctionComponent<ContactsViewProps> = ({
  canEdit,
}) => {
  const { t } = useTranslation();
  const { data: extpipe } = useSelectedExtpipe();

  const [showModal, setShowModal] = useState(false);
  if (!extpipe) {
    return <></>;
  }
  const { contacts } = extpipe;
  const contactsSorted = [...(contacts ?? [])].sort(
    (a, b) =>
      (isOwnerRole(a.role ?? '') ? -1000 : 0) -
      (isOwnerRole(b.role ?? '') ? -1000 : 0)
  );

  const openEdit = () => {
    setShowModal(canEdit);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <Modal
        size="large"
        title={t('contacts')}
        visible={showModal}
        onCancel={closeModal}
        hideFooter
      >
        <ContactsDialog close={closeModal} />
      </Modal>
      <Section
        extra={
          <Button
            disabled={!canEdit}
            onClick={openEdit}
            size="small"
            type="ghost"
          >
            Edit
          </Button>
        }
        title={t('contacts')}
        icon="Users"
        items={
          contacts && contacts.length > 0
            ? contactsSorted.map((contact) => ({
                key: contact.email,
                extraContent: <Chip size="x-small" label={contact.role} />,
                title: contact.name,
                value: (
                  <Flex alignItems="center" gap={4}>
                    <a href={`mailto:${contact.email}`}>{contact.email}</a>
                    {contact.sendNotification && (
                      <Icon type="BellFilled" size={12} />
                    )}
                  </Flex>
                ),
              }))
            : [
                {
                  key: 'contacts',
                  value: t('no-contact-added'),
                },
              ]
        }
      />
    </>
  );
};

export const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;
