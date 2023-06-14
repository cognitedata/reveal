import { useParams } from 'react-router-dom';

import { Page } from '../../containers/page/Page';
import { FileWidget, PropertiesWidget } from '../../containers/widgets';
import { useFileByIdQuery } from '../../services/instances/file/queries/useFileByIdQuery';

export const FilePage = () => {
  const { externalId } = useParams();

  const { data, isLoading } = useFileByIdQuery(externalId);

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
