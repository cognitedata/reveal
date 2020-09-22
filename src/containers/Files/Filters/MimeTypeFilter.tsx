import React, { useContext } from 'react';
import { FileInfo } from 'cognite-sdk-v3';
import { Select } from 'antd';
import { ResourceSelectionContext } from 'context';
import { SelectWrapper } from 'components/Common';
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
      <SelectWrapper>
        <Select
          value={fileFilter.mimeType}
          onSelect={(el: string) => {
            setFileFilter(filter => ({ ...filter, mimeType: el }));
          }}
          onChange={(el: string) => {
            if (!el) {
              setFileFilter(filter => ({ ...filter, mimeType: undefined }));
            }
          }}
          style={{ width: '100%' }}
          allowClear
        >
          {[...mimeTypes].map(el => {
            return (
              <Select.Option key={el} value={el}>
                {el}
              </Select.Option>
            );
          })}
        </Select>
      </SelectWrapper>
    </>
  );
};
