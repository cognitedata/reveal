import React, { useState } from 'react';
import { Button, Input, Select } from '@cognite/cogs.js';
import Modal from './Modal';
import { SuiteContainer, SelectLabel, SelectContainer } from './elements';

interface Props {
  buttonText: string;
}

export const AddDashboardModal: React.FC<Props> = ({ buttonText }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenModal = () => {
    setIsOpen(true);
  };

  const handleCLoseModal = () => {
    setIsOpen(false);
  };

  const footer = (
    <>
      <Button variant="ghost" onClick={handleCLoseModal}>
        Cancel
      </Button>
      <Button type="secondary">Manage Access</Button>
      <Button type="primary">Save</Button>
    </>
  );

  return (
    <>
      <Button
        variant="outline"
        type="secondary"
        icon="Plus"
        iconPlacement="left"
        onClick={handleOpenModal}
      >
        {buttonText}
      </Button>
      <Modal
        visible={isOpen}
        onCancel={handleCLoseModal}
        headerText="Add board to suite"
        footer={footer}
        width={536}
      >
        <SuiteContainer>
          <Input
            title="Title"
            name="title"
            variant="noBorder"
            placeholder="Title"
            fullWidth
          />
          <SelectContainer>
            <SelectLabel>Select type</SelectLabel>
            <Select theme="grey" placeholder="Select type" />
          </SelectContainer>
          <Input title="URL" variant="noBorder" placeholder="URL" fullWidth />
          <Input
            title="Iframe snapshot"
            name="embedTag"
            variant="noBorder"
            placeholder="Tag"
            fullWidth
          />
        </SuiteContainer>
      </Modal>
    </>
  );
};
