import React, { FunctionComponent, useState } from 'react';
import { useSelectedExtpipe } from 'hooks/useExtpipe';
import { EditModal } from 'components/modals/EditModal';
import { ContactsDialog, isOwnerRole } from 'components/extpipe/ContactsDialog';
import styled from 'styled-components';
import Section from 'components/section';
import { Flex, Icon, Label } from '@cognite/cogs.js';
import { useTranslation } from 'common';
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
      <EditModal
        title={t('contacts')}
        visible={showModal}
        close={closeModal}
        width={1024}
      >
        <ContactsDialog close={closeModal} />
      </EditModal>
      <Section
        extraButton={{
          children: 'Edit',
          disabled: !canEdit,
          onClick: openEdit,
          size: 'small',
          type: 'ghost',
        }}
        title={t('contacts')}
        icon="Users"
        items={
          contacts && contacts.length > 0
            ? contactsSorted.map((contact) => ({
                key: contact.email,
                extraContent: (
                  <Label size="small" variant="unknown">
                    {contact.role}
                  </Label>
                ),
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
