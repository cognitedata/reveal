import { Input, Select, toast, Icon, Tooltip } from '@cognite/cogs.js';
import { Modal } from 'components/Modal/Modal';
import { KeyboardEventHandler, useState } from 'react';
import styled from 'styled-components';
import CreatableSelect from 'react-select/creatable';
import { OnChangeValue } from 'react-select';

import { useLabels } from '../../../hooks/useLabels';
import { useLabelSchemaMutation } from '../../../hooks/useLabelSchemaMutation';
import { customLabelCreatableOptions } from '../constants';

import { SchemaContainer } from './Schema/Item';

export interface Option<Value> {
  label: string;
  value: Value;
}

export const CreateSchemaModal: React.FC = () => {
  const { mutate } = useLabelSchemaMutation();
  const [visible, setVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [keys, setKeys] = useState<{ label: string; value: string }[]>([]);

  const [name, setName] = useState('');
  const [labelOption, setLabelOption] = useState<Option<string> | undefined>();

  const { data: labels } = useLabels();

  const resetState = () => {
    setName('');
    setLabelOption(undefined);
    setInputValue('');
    setKeys([]);
  };

  const handleInputChange = (inputValue: string) => {
    setInputValue(inputValue);
  };

  const createOption = (label: string) => ({
    label,
    value: label,
  });

  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    const inputValueTemp = inputValue;
    if (!inputValueTemp) return;
    switch (event.key) {
      case 'Enter':
      case 'Tab':
        setInputValue('');

        setKeys((prevState) => {
          return [...(prevState || []), createOption(inputValueTemp)];
        });
        event.preventDefault();
    }
  };

  const handleChange = (
    value: OnChangeValue<Option<{ label: string; value: string }>, true>
  ) => {
    setKeys(value as []);
  };
  const toggleVisibility = () => setVisible((prevState) => !prevState);

  const createNewSchema = () => {
    if (labelOption?.value && keys?.length) {
      mutate({
        name,
        labelExternalId: labelOption.value,
        keys: (keys || []).map((key) => key.value),
      });
      resetState();
      setVisible(false);
    } else {
      toast.error('Label and Keys are required');
    }
  };

  const fileTypeOptions: Option<string>[] = (labels || []).map((item) => ({
    value: item.externalId,
    label: item.name,
  }));

  const components = {
    DropdownIndicator: null,
  };

  return (
    <>
      <Modal
        title="Create new schema"
        visible={visible}
        modalSize="30rem"
        onOk={() => createNewSchema()}
        onCancel={() => toggleVisibility()}
      >
        <Container>
          <Input
            required
            title="Name *"
            placeholder="Choose a schema name"
            maxLength={255}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="title select-title">Label</div>
          <Select<any>
            title="Label"
            icon="Tag"
            required
            options={fileTypeOptions}
            appendTo={document.body}
            maxMenuHeight={400}
            value={labelOption}
            onChange={(option: { value: string; label: string }) => {
              setLabelOption(option);
            }}
          />

          <div className="title select-title">Create Custom Labels</div>
          <CreatableSelect
            options={customLabelCreatableOptions}
            components={components}
            inputValue={inputValue}
            isClearable
            isMulti
            onChange={handleChange}
            onInputChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Create custom labels (press Enter to add more)"
            value={keys}
          />
        </Container>
      </Modal>

      <Tooltip content="Create a new schema">
        <CreateButton onClick={() => toggleVisibility()}>
          <Icon size={64} type="Plus" />
        </CreateButton>
      </Tooltip>
    </>
  );
};

const CreateButton = styled(SchemaContainer).attrs({ className: 'z-4' })`
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  min-height: 250px;
`;

const Container = styled.div`
  margin-top: 1rem;

  .select-title {
    margin-top: 1rem;
  }

  .input-wrapper,
  input {
    width: 100%;
  }
`;
