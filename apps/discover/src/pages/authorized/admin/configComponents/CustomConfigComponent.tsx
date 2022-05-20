import * as React from 'react';

import findIndex from 'lodash/findIndex';

import { CustomComponentProps } from '../projectConfig';

import { LayersFormModal } from './LayersFormModal';
import { MetadataFormModal } from './MetadataFormModal';

export const CustomConfigComponent = ({
  onClose,
  onChangeAndUpdate,
  metadataValue,
  type,
  value,
  values,
  valuePath,
  mode,
}: CustomComponentProps) => {
  const onOk = (datum: Record<string, unknown>) => {
    if (values) {
      if (mode === 'EDIT') {
        const index = findIndex(values as any[], ['id', datum.id]);
        onChangeAndUpdate(
          valuePath,
          Object.assign([], values, { [index]: datum })
        );
      } else {
        onChangeAndUpdate(valuePath, [...(values as any[]), datum]);
      }
    } else {
      onChangeAndUpdate(valuePath, [datum]);
    }
    onClose();
  };

  switch (type) {
    case 'map.children.layers':
      return (
        <LayersFormModal
          onClose={onClose}
          onOk={onOk}
          metadataValue={metadataValue}
          value={value}
          mode={mode}
        />
      );
    default:
      return (
        <MetadataFormModal
          onClose={onClose}
          onOk={onOk}
          metadataValue={metadataValue}
          value={value}
          mode={mode}
        />
      );
  }
};
