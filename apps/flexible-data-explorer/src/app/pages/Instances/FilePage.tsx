import { useParams } from 'react-router-dom';

import { FileInfo as File } from '@cognite/sdk';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';

import { Page } from '../../containers/page/Page';
import { FileWidget, PropertiesWidget } from '../../containers/widgets';

const getFileId = (externalId?: string) => {
  if (!externalId) {
    throw new Error('External id is required');
  }

  return Number(externalId) ? { id: Number(externalId) } : { externalId };
};

export const FilePage = () => {
  const { externalId } = useParams();

  const { data, isLoading } = useCdfItem<File>('files', getFileId(externalId), {
    enabled: !!externalId,
  });

  return (
    <Page.Dashboard
      customName={data?.name}
      customDataType="File"
      loading={isLoading}
    >
      <Page.Widgets>
        <FileWidget id="Preview" fileId={data?.id} rows={8} columns={2} />
        <PropertiesWidget id="Properties" data={data} columns={2} />
      </Page.Widgets>
    </Page.Dashboard>
  );
};
