import React from 'react';

import { useSelectFilter, useSelectionFetchStatus } from '../../../hooks';
import { Select } from '../../Common';

import { mimeTypes } from './utils';

type Props = {
  selectedMimeType?: string[];
  onMimeTypeSelected: (selectedMimeType: string[]) => void;
  loaded?: boolean;
  isMulti?: boolean;
  style?: React.CSSProperties;
};

export const MimeTypeSelect = (props: Props) => {
  const {
    selectedMimeType,
    onMimeTypeSelected,
    loaded = false,
    isMulti = false,
  } = props;

  const mimeType = selectedMimeType?.[0];
  const { isLoaded } = useSelectionFetchStatus('files', {
    filter: mimeType ? { mimeType } : {},
  });

  const { currentSelection, setMultiSelection, setSingleSelection } =
    useSelectFilter<string>(
      loaded || isLoaded,
      mimeTypes,
      selectedMimeType,
      onMimeTypeSelected
    );

  return (
    <Select
      selectProps={{
        title: 'File type:',
        isMulti,
        placeholder: 'All',
        options: mimeTypes,
        value: currentSelection,
        onChange: isMulti ? setMultiSelection : setSingleSelection,
      }}
    />
  );
};
