import { TableNoResults } from '@cognite/cdf-utilities';
import { Icon, Table } from '@cognite/cogs.js';
import { Sequence } from '@cognite/sdk';

import { useTranslation } from '../../common/i18n';
import { ContentView } from '../../utils';
import { useResourceTableColumns } from '../Data/ResourceTableColumns';

interface sequencesTableProps {
  data: Sequence[] | undefined;
  isLoading: boolean;
}

const SequencesTable = ({ data = [], isLoading }: sequencesTableProps) => {
  const { t } = useTranslation();
  const { sequenceColumns } = useResourceTableColumns();

  return (
    <ContentView
      id="sequencesTableId"
      className="resource-table dataset-sequence-table"
    >
      {isLoading ? (
        <div className="loader-wrapper">
          <Icon type="Loader" size={32} />
        </div>
      ) : (
        <Table
          rowKey={(d) => String(d.id)}
          // The types are interfaces instead of type, can't get them to work
          // with the types defined in the library. The components worked and
          // still work fine, therefore I think it's safe to provide any.
          columns={sequenceColumns as any}
          dataSource={data as any}
          locale={{
            emptyText: (
              <TableNoResults
                title={t('no-records')}
                content={t('no-search-records', {
                  $: '',
                })}
              />
            ),
          }}
        />
      )}
    </ContentView>
  );
};

export default SequencesTable;
