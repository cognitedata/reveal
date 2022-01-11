import React from 'react';

import head from 'lodash/head';

import { Input } from '@cognite/cogs.js';

export const FileReaderComp = ({
  onRead,
  error,
}: {
  onRead: (res: unknown) => void;
  error?: boolean | string;
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
      error={error}
      accept=".json,.JSON,.geojson,.GEOJSON"
      onChange={onChange}
    />
  );
};
