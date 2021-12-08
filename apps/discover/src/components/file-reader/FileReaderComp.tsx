import React from 'react';

import head from 'lodash/head';

import { Input } from '@cognite/cogs.js';

export const FileReaderComp = ({
  onRead,
}: {
  onRead: (res: unknown) => void;
}) => {
  const reader = React.useRef<FileReader>(new FileReader());

  React.useEffect(() => {
    reader.current.onload = (readEvent) => {
      if (!readEvent.target?.error) {
        onRead(readEvent.target?.result);
      }
    };
  }, []);

  const onChange = (event: React.SyntheticEvent<HTMLInputElement>) => {
    const file = head(event.currentTarget.files);
    if (!file) {
      return;
    }
    reader.current.readAsText(file);
  };

  return (
    <Input
      type="file"
      name="Upload JSON"
      title="Upload JSON"
      accept="application/JSON"
      onChange={onChange}
    />
  );
};
