import React, { useState, useEffect } from 'react';
import { Select } from '@cognite/cogs.js';
import { OptionsType } from './types';
import { selectStyles } from './utils';

const mimeTypes = [
  {
    label: 'PDF',
    value: 'application/pdf',
  },
  {
    label: 'JPG',
    value: 'image/jpeg',
  },
  {
    label: 'PNG',
    value: 'image/png',
  },
];

type Props = {
  selectedMimeType: string;
  onMimeTypeSelected: (selectedMimeType: OptionsType) => void;
};

export default function MimeTypeSelect(props: Props) {
  const { selectedMimeType, onMimeTypeSelected } = props;
  const [value, setValue] = useState<OptionsType | undefined>(mimeTypes[0]);

  const onMimeTypeSelect = (option: OptionsType) => {
    onMimeTypeSelected(option);
  };

  useEffect(() => {
    const selectedType = mimeTypes.find(
      (mimeType: OptionsType) => mimeType.value === selectedMimeType
    );
    setValue(selectedType);
  }, [selectedMimeType]);

  return (
    <div style={{ minWidth: '250px' }}>
      <Select
        title="File type"
        placeholder=""
        options={mimeTypes}
        isClearable
        value={value}
        onChange={onMimeTypeSelect}
        styles={selectStyles}
      />
    </div>
  );
}
