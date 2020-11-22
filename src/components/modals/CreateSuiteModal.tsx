import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Input, Title, Select } from '@cognite/cogs.js';
import { suites } from 'mocks/suites';
import Modal from './Modal';
import { SuiteContainer, SelectLabel, SelectContainer } from './elements';

interface Props {
  buttonText: string;
}

const dashboard: any = { key: '', type: '', title: '', url: '', embedTag: '' };

const suite: any = {
  key: `row-${suites.items.length + 1}`,
  columns: {
    title: '',
    description: '',
    color: '#F4DAF8',
    dashboards: [],
  },
  lastUpdatedTime: 1604509799577,
};

export const CreateSuiteModal: React.FC<Props> = ({ buttonText }: Props) => {
  const { ...updateSuite } = suite;
  const [newSuite, setNewSuite] = useState(updateSuite);
  const history = useHistory();

  const [isOpen, setIsOpen] = useState(false);

  const handleOpenModal = () => {
    setIsOpen(true);
  };

  const handleCLoseModal = () => {
    setIsOpen(false);
  };

  const handleSubmit = () => {
    suites.items.push(newSuite);
    history.push(`/suites/${newSuite.key}`);
  };

  const handleSuiteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    suite.columns[event.target.name] = event.target.value;
    setNewSuite(suite);
  };

  const handleDashboardChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    dashboard[event.target.name] = event.target.value;
    setNewSuite((prevState: any) => ({
      ...prevState,
      columns: {
        ...prevState.columns,
        dashboards: suite.columns.dashboards.concat(dashboard),
      },
    }));
  };

  const footer = (
    <>
      <Button variant="ghost" onClick={handleCLoseModal}>
        Cancel
      </Button>
      <Button type="secondary">Manage Access</Button>
      <Button type="primary" onClick={handleSubmit}>
        Save
      </Button>
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
        headerText="Create a new suite"
        footer={footer}
        width={536}
      >
        <SuiteContainer>
          <Input
            title="Title"
            name="title"
            variant="noBorder"
            placeholder="Name of suite"
            onChange={handleSuiteChange}
            fullWidth
          />
          <Input
            title="Description"
            name="description"
            variant="noBorder"
            placeholder="Description that clearly explains the purpose of the suite"
            onChange={handleSuiteChange}
            fullWidth
          />
          <Title level={4}>Add boards</Title>
          <Input
            title="Title"
            name="title"
            variant="noBorder"
            placeholder="Title"
            onChange={handleDashboardChange}
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
            onChange={handleDashboardChange}
            fullWidth
          />
        </SuiteContainer>
      </Modal>
    </>
  );
};
