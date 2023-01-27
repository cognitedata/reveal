import { Flex, Input, Select } from '@cognite/cogs.js';
import { useState } from 'react';
import { Modal } from '../components/Modal/Modal';
import ModalFooter from '../components/Modal/ModalFooter';
import { Convention } from '../pages/conventions/types';

interface Props {
  selectedConvention?: Convention;
  conventions?: Convention[];
  toggleVisibility: () => void;
  onChange: (item: Convention) => void;
}
export const ManageSelectedConvention: React.FC<Props> = ({
  conventions,
  selectedConvention,
  toggleVisibility,
  onChange,
}) => {
  const [convention, setConvention] = useState<Convention | undefined>(
    selectedConvention
  );

  if (!convention) {
    return null;
  }

  const handleOnSaveClick = () => {
    onChange(convention);
    toggleVisibility();
  };

  return (
    <Modal
      visible
      modalWidth="50%"
      modalHeight="50%"
      onCancel={toggleVisibility}
      title="Setup coding structure"
      footer={
        <ModalFooter
          onCancel={toggleVisibility}
          okText="Save"
          onOk={handleOnSaveClick}
        />
      }
    >
      <Flex gap={8} direction="column">
        <Input
          placeholder="Name"
          value={convention.name}
          onChange={(e) => {
            const { value } = e.target;
            setConvention((prevState) => ({ ...prevState!, name: value }));
          }}
        />
        <Select
          isClearable
          hideSelectedOptions
          value={
            convention.dependency
              ? {
                  label:
                    conventions?.find(
                      (item) => item.id === convention.dependency
                    )?.name || '',
                  value: convention.dependency,
                }
              : undefined
          }
          options={(conventions || [])
            .filter((item) => convention.id !== item.id) // Remove current convention
            .map((item) => {
              const disabled = item.dependency === convention.id; // Avoid cyclic dependencies
              return {
                label: item.name || item.keyword,
                value: item.id,
                disabled,
                helpText: disabled ? 'No cyclic dependencies' : '',
              };
            })}
          onChange={(newValue: any) => {
            setConvention((prevState) => ({
              ...prevState!,
              dependency: newValue.value,
            }));
          }}
          placeholderElement={<>Depends on:</>}
        />
      </Flex>
    </Modal>
  );
};
