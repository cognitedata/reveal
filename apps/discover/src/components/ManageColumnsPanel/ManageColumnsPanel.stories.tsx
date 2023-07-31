// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck - PLEASE FIX NEXT TIME YOU CHANGE THIS FILE

import { useState } from 'react';

import { Button } from '@cognite/cogs.js';

import { Typography } from 'components/Typography';

import ManageColumnsPanel from './ManageColumnsPanel';

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  title: 'Components / ManageColumnsPanel',
  component: ManageColumnsPanel,
  decorators: [
    (storyFn) => (
      <div style={{ position: 'relative', height: 300 }}>{storyFn()}</div>
    ),
  ],
};

export const Basic = () => {
  const [items, setItems] = useState([
    { name: 'X-wing', selected: false },
    { name: 'Bulwark mark III', selected: true },
    { name: 'MC80 Liberty', selected: false },
  ]);

  const handleColumnSelection = (changedItem) => {
    const i = items.map((item) =>
      item === changedItem ? { ...item, selected: !changedItem.selected } : item
    );
    setItems(i);
  };

  const handleSelectAllColumns = (shouldSelectAll) => {
    const i = items.map((item) => ({ ...item, selected: shouldSelectAll }));
    setItems(i);
  };

  return (
    <ManageColumnsPanel
      columns={items}
      handleSelectAllColumns={handleSelectAllColumns}
      handleColumnSelection={handleColumnSelection}
    />
  );
};

export const WithCustomButton = () => {
  const [items, setItems] = useState([
    { name: 'X-wing', selected: false },
    { name: 'Bulwark mark III', selected: true },
    { name: 'MC80 Liberty', selected: false },
  ]);

  const handleColumnSelection = (changedItem) => {
    const i = items.map((item) =>
      item === changedItem ? { ...item, selected: !changedItem.selected } : item
    );
    setItems(i);
  };

  const handleSelectAllColumns = (shouldSelectAll) => {
    const i = items.map((item) => ({ ...item, selected: shouldSelectAll }));
    setItems(i);
  };

  return (
    <ManageColumnsPanel
      columns={items}
      handleSelectAllColumns={handleSelectAllColumns}
      handleColumnSelection={handleColumnSelection}
    >
      <Button variant="default" aria-label="Button example">
        Click me!
      </Button>
    </ManageColumnsPanel>
  );
};

export const WithCustomRenderer = () => {
  const [items, setItems] = useState([
    { name: 'X-wing', selected: false },
    { name: 'Bulwark mark III', selected: true },
    { name: 'MC80 Liberty', selected: false },
  ]);

  const handleColumnSelection = (changedItem) => {
    const i = items.map((item) =>
      item === changedItem ? { ...item, selected: !changedItem.selected } : item
    );
    setItems(i);
  };

  const handleSelectAllColumns = (shouldSelectAll) => {
    const i = items.map((item) => ({ ...item, selected: shouldSelectAll }));
    setItems(i);
  };

  const customRenderer = (item) => {
    const color = item.selected ? 'green' : '';
    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events
      <div
        key={item.name}
        onClick={() => handleColumnSelection(item)}
        role="button"
        tabIndex={0}
      >
        <Typography
          variant="microheader"
          style={{ padding: 8, cursor: 'pointer', color }}
        >
          {item.name}
        </Typography>
      </div>
    );
  };

  return (
    <ManageColumnsPanel
      renderItem={customRenderer}
      columns={items}
      handleSelectAllColumns={handleSelectAllColumns}
    />
  );
};
