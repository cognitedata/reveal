import React, { useContext } from 'react';
import ResourceSelectionContext, {
  ResourceItem,
} from 'context/ResourceSelectionContext';
import { Button, Checkbox } from '@cognite/cogs.js';

export const useSelectionButton = () => {
  const { mode, onSelect, resourcesState } = useContext(
    ResourceSelectionContext
  );
  return (item: ResourceItem, small = false) => {
    let resourceName = 'Resource';
    switch (item.type) {
      case 'assets': {
        resourceName = 'Asset';
        break;
      }
      case 'events': {
        resourceName = 'Event';
        break;
      }
      case 'sequences': {
        resourceName = 'Sequence';
        break;
      }
      case 'files': {
        resourceName = 'File';
        break;
      }
      case 'timeseries': {
        resourceName = 'Time Series';
        break;
      }
    }

    if (mode === 'multiple') {
      const isInCart = resourcesState.some(
        el =>
          el.type === item.type && el.id === item.id && el.state === 'selected'
      );
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
          {`Select ${resourceName}`}
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
    const isInCart = resourcesState.some(
      el =>
        el.type === item.type && el.id === item.id && el.state === 'selected'
    );
    if (mode === 'none') {
      return null;
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
