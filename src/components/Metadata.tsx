import { useState, useMemo } from 'react';
import { Input, Table } from 'antd';
import { Checkbox } from '@cognite/cogs.js';
import styled from 'styled-components';
import { useTranslation } from 'common/i18n';

export function Metadata({ metadata }: { metadata?: { [k: string]: string } }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [hideEmpty, setHideEmpty] = useState(false);

  const filteredMetadata = useMemo(
    () =>
      metadata
        ? Object.entries(metadata).filter(([key, value]) => {
            if (hideEmpty && !value) {
              return false;
            }
            return (
              query.length === 0 ||
              key.toLowerCase().includes(query.toLowerCase()) ||
              value.toLowerCase().includes(query.toLowerCase())
            );
          })
        : [],
    [metadata, query, hideEmpty]
  );
  if (!metadata || Object.keys(metadata).length === 0) {
    return null;
  }
  return (
    <>
      <MetadataHeader>
        <h3>{t('metadata')}</h3>
        <FilterContainer>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('filter-metadata')}
            allowClear
            style={{ maxWidth: '300px', marginRight: '16px' }}
          />
          <Checkbox
            name="hideEmpty"
            value={hideEmpty}
            onChange={(nextState: boolean) => setHideEmpty(nextState)}
          >
            {t('hide-empty')}
          </Checkbox>
        </FilterContainer>
      </MetadataHeader>
      <MetadataTableContainer>
        <Table
          dataSource={filteredMetadata.map((item) => ({
            key: item[0],
            value: item[1],
          }))}
          columns={[
            {
              title: t('key'),
              dataIndex: 'key',
              key: 'key',
              width: '50%',
            },
            {
              title: t('value'),
              dataIndex: 'value',
              key: 'value',
              width: '50%',
            },
          ]}
          pagination={false}
          bordered
          rowClassName={() => 'metadata-table-row'}
        />
      </MetadataTableContainer>
    </>
  );
}

const MetadataHeader = styled.div`
  padding: 0 16px;
`;

const MetadataTableContainer = styled.div`
  margin: 8px 16px 0;
  max-width: 900px;
  .metadata-table-row {
    background-color: var(--cogs-white);
  }
`;

const FilterContainer = styled.div`
  display: flex;
  margin-bottom: 16px;
`;
