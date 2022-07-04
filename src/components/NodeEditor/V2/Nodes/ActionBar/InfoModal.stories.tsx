import { Button } from '@cognite/cogs.js';
import { ComponentMeta, Story } from '@storybook/react';
import { fullListOfOperations } from 'models/calculation-backend/operations/mocks/mocks';
import { ComponentProps, useState } from 'react';
import InfoModal from './InfoModal';

export default {
  component: InfoModal,
  title: 'Components/Node Editor/v2/Nodes/Operation Info Modal',
} as ComponentMeta<typeof InfoModal>;

const Template: Story<ComponentProps<typeof InfoModal>> = (args) => (
  <InfoModal {...args} />
);

export const Uncontrolled = Template.bind({});

Uncontrolled.args = {
  isOpen: true,
  indslFunction: fullListOfOperations[0].versions[0],
};

export const Controlled = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Click to Open the modal</Button>
      <InfoModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        indslFunction={fullListOfOperations[0].versions[0]}
      />
    </>
  );
};
