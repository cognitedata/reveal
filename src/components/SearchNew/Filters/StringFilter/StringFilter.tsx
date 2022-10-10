import React from 'react';
import { Body, Input } from '@cognite/cogs.js';

export const StringFilterV2 = ({
  value,
  setValue,
  title,
  placeholder = 'Starts with...',
}: {
  title: string;
  placeholder?: string;
  value: string | undefined;
  setValue: (newValue: string | undefined) => void;
}) => {
  const setNewString = (newValue: string | undefined) => {
    setValue(newValue && newValue.length > 0 ? newValue : undefined);
  };

  return (
    <>
      <Body
        level={2}
        strong
        style={{ marginBottom: 5, marginTop: 10 }}
        className="title"
      >
        {title}
      </Body>
      <Input
        style={{
          width: '100%',
          backgroundColor: '#f1f1f1',
          border: 'none',
        }}
        value={value || ''}
        placeholder={placeholder}
        onChange={ev => setNewString(ev.target.value)}
      />
    </>
  );
};
