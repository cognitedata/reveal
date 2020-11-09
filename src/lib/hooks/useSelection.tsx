import React from 'react';
import { ResourceItem } from 'lib/types';
import { Button, Checkbox, Colors } from '@cognite/cogs.js';

export type ResourceSelectionMode = 'single' | 'multiple' | 'none';
export type OnResourceSelectedCallback = () => void;

export const useSelectionButton = (
  mode: ResourceSelectionMode,
  item: ResourceItem,
  isSelected: boolean,
  onSelect: OnResourceSelectedCallback,
  small = false
) => {
  return () => {
    let resourceName = 'Resource';
    switch (item.type) {
      case 'asset': {
        resourceName = 'Asset';
        break;
      }
      case 'event': {
        resourceName = 'Event';
        break;
      }
      case 'sequence': {
        resourceName = 'Sequence';
        break;
      }
      case 'file': {
        resourceName = 'File';
        break;
      }
      case 'timeSeries': {
        resourceName = 'Time series';
        break;
      }
    }
    if (mode === 'multiple') {
      return (
        <Button
          key={`${item.id}-select-button`}
          type={isSelected ? 'secondary' : 'primary'}
          icon={isSelected ? 'Minus' : 'Plus'}
          size={small ? 'small' : 'default'}
          onClick={() => {
            onSelect();
          }}
        >
          {isSelected ? 'Un-Select' : 'Select'}
        </Button>
      );
    }
    if (mode === 'single') {
      return (
        <Button
          key={`${item.id}-select-button`}
          type="primary"
          onClick={() => {
            onSelect();
          }}
          size={small ? 'small' : 'default'}
          icon="Plus"
        >
          {isSelected ? 'Current Selection' : `Select ${resourceName}`}
        </Button>
      );
    }
    return null;
  };
};

export const useSelectionCheckbox = (
  mode: ResourceSelectionMode,
  id: string | number,
  isSelected: boolean,
  onSelect: OnResourceSelectedCallback
): JSX.Element => {
  if (mode === 'none') {
    return <></>;
  }
  if (mode === 'single') {
    return (
      <Button
        key={`${id}-select-button`}
        onClick={e => {
          e.stopPropagation();
          onSelect();
        }}
        style={{
          background: isSelected
            ? Colors['midblue-7'].hex()
            : Colors['greyscale-grey2'].hex(),
        }}
        icon="Check"
      />
    );
  }
  return (
    <Checkbox
      key={`${id}-select-button`}
      value={isSelected}
      onClick={e => e.stopPropagation()}
      onChange={() => {
        onSelect();
      }}
      name={`${id}`}
    />
  );
};
