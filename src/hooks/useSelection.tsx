import React, { useContext } from 'react';
import ResourceSelectionContext from 'context/ResourceSelectionContext';
import { ResourceItem } from 'types';
import { Button, Checkbox, Colors } from '@cognite/cogs.js';

export const useSelectionButton = () => {
  const { mode, onSelect, resourcesState } = useContext(
    ResourceSelectionContext
  );
  return (item: ResourceItem, small = false) => {
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
        resourceName = 'Time Series';
        break;
      }
    }
    const isInCart = resourcesState.some(
      el =>
        el.type === item.type && el.id === item.id && el.state === 'selected'
    );

    if (mode === 'multiple') {
      return (
        <Button
          key="select-button"
          type={isInCart ? 'secondary' : 'primary'}
          icon={isInCart ? 'Minus' : 'Plus'}
          size={small ? 'small' : 'default'}
          onClick={() => {
            onSelect(item);
          }}
        >
          {isInCart ? 'Un-Select' : 'Select'}
        </Button>
      );
    }
    if (mode === 'single') {
      return (
        <Button
          key="select-button"
          type="primary"
          onClick={() => {
            onSelect(item);
          }}
          size={small ? 'small' : 'default'}
          icon="Plus"
        >
          {isInCart ? 'Current Selection' : `Select ${resourceName}`}
        </Button>
      );
    }
    return null;
  };
};

export const useSelectionCheckbox = () => {
  const { mode, onSelect, resourcesState } = useContext(
    ResourceSelectionContext
  );
  return (item: ResourceItem) => {
    if (mode === 'none') {
      return null;
    }
    const isInCart = resourcesState.some(
      el =>
        el.type === item.type && el.id === item.id && el.state === 'selected'
    );
    if (mode === 'single') {
      return (
        <Button
          key="select-button"
          onClick={e => {
            e.stopPropagation();
            onSelect(item);
          }}
          style={{
            background: isInCart
              ? Colors['midblue-7'].hex()
              : Colors['greyscale-grey2'].hex(),
          }}
          icon="Check"
        />
      );
    }
    return (
      <Checkbox
        key="select-button"
        value={isInCart}
        onClick={e => e.stopPropagation()}
        onChange={() => {
          onSelect(item);
        }}
        name={`${item.type}-${item.id}`}
      />
    );
  };
};
