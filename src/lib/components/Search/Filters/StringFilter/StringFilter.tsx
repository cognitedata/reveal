import React from 'react';
import { Body, Input } from '@cognite/cogs.js';

export const StringFilter = ({
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
  const setNewString = (newValue: string) => {
    setValue(newValue.length > 0 ? newValue : undefined);
  };

  return (
    <>
      <Body
        level={4}
        style={{ marginBottom: 5, marginTop: 10 }}
        className="title"
      >
        {title}
      </Body>
      <Input
        variant="default"
        style={{ width: '100%', borderColor: '#cccccc' }}
        value={value}
        placeholder={placeholder}
        onChange={ev => setNewString(ev.target.value)}
      />
    </>
  );
};
