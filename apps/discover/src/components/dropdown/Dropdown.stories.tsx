// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck - PLEASE FIX NEXT TIME YOU CHANGE THIS FILE

import { useState } from 'react';

import { Button } from '@cognite/cogs.js';

import { Typography } from '../typography';

import { Dropdown } from './Dropdown';
import { Select } from './Select';

export const dropdown = () => {
  const [state, setState] = useState({ id: 1, title: 'test' });
  const items = [
    { id: 1, title: 'test' },
    { id: 2, title: 'test 2' },
    { id: 3, title: 'test 3' },
  ];

  return (
    <div>
      <Typography variant="h5">Default</Typography>
      <div>
        <Dropdown
          handleChange={(e, item) => setState({ ...item })}
          style={{ marginRight: 16 }}
          selected={state}
          items={items}
          displayField="title"
          valueField="id"
        />
        <Dropdown
          handleChange={(e, item) => setState({ ...item })}
          style={{ marginRight: 16 }}
          label="With Label"
          selected={state}
          items={items}
          displayField="title"
          valueField="id"
        />
      </div>
      <br /> <br />
      <Typography variant="h5">Custom component</Typography>
      <div>
        <Dropdown
          handleChange={(e, item) => setState({ ...item })}
          selected={state}
          component={
            <Button variant="outline">
              {state ? state.title : 'Open list'}
            </Button>
          }
          style={{ marginRight: 16 }}
          items={items}
          displayField="title"
          valueField="id"
        />
        <Dropdown
          handleChange={(e, item) => setState({ ...item })}
          selected={state}
          component={
            <Button variant="default">
              {state ? state.title : 'Open list'}
            </Button>
          }
          style={{ marginRight: 16 }}
          items={items}
          displayField="title"
          valueField="id"
        />
      </div>
    </div>
  );
};

export const SelectStory = () => {
  const [selected, setSelected] = useState(null);
  const items = [
    { id: 1, title: 'test' },
    { id: 2, title: 'test 2' },
    { id: 3, title: 'test 3' },
    { id: 4, title: 'test 4' },
    { id: 5, title: 'test 5' },
    { id: 6, title: 'test 6' },
    { id: 7, title: 'test 7' },
    { id: 8, title: 'test 8' },
    { id: 9, title: 'test 9' },
    { id: 10, title: 'test 10' },
    { id: 11, title: 'test 11' },
    { id: 12, title: 'test 12' },
    { id: 13, title: 'test 13' },
    { id: 14, title: 'test 14' },
    { id: 15, title: 'test 15' },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Select
        renderDisplay={(item) => item.title}
        items={items}
        onClick={(item) => setSelected(item)}
        selectedItem={selected}
      >
        <Button aria-label="Open list">Open list</Button>
      </Select>

      <div style={{ paddingLeft: 16 }}>
        Selected item: {selected && selected.title}
      </div>
    </div>
  );
};
