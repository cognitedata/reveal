import React, { useContext } from 'react';
import { FileInfo } from '@cognite/sdk';
import { ResourceSelectionContext } from 'lib/context';
import { Select } from 'lib/components';
import { Title } from '@cognite/cogs.js';

export const MimeTypeFilter = ({ items }: { items: FileInfo[] }) => {
  const { fileFilter, setFileFilter } = useContext(ResourceSelectionContext);

  const mimeTypes: Set<string> = new Set();
  items.forEach(el => {
    if (el.mimeType) {
      mimeTypes.add(el.mimeType);
    }
  });

  return (
    <>
      <Title level={4} style={{ marginBottom: 12 }} className="title">
        File type
      </Title>
      <Select
        creatable
        value={
          fileFilter.mimeType
            ? { label: fileFilter.mimeType, value: fileFilter.mimeType }
            : undefined
        }
        onChange={item => {
          if (!item) {
            setFileFilter(filter => ({ ...filter, mimeType: undefined }));
          } else {
            setFileFilter(filter => ({
              ...filter,
              mimeType: (item as { value: string }).value,
            }));
          }
        }}
        options={[...mimeTypes].map(el => {
          return {
            value: el,
            label: el,
          };
        })}
      />
    </>
  );
};
