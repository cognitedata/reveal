import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Button, Dropdown } from '@fdx/components';
import { Page } from '@fdx/modules/page/Page';
import { FileWidget } from '@fdx/modules/widgets/File/FileWidget';
import { PropertiesWidget } from '@fdx/modules/widgets/Properties/PropertiesWidget';
import { useFileByIdQuery } from '@fdx/services/instances/file/queries/useFileByIdQuery';
import { useOpenIn } from '@fdx/shared/hooks/useOpenIn';
import { useRecentlyVisited } from '@fdx/shared/hooks/useRecentlyVisited';

export const FilePage = () => {
  const { externalId } = useParams();
  const [, setRecentlyVisited] = useRecentlyVisited();
  const { openAssetCentricResourceItemInCanvas } = useOpenIn();

  const { data, isLoading, isFetched, status } = useFileByIdQuery(externalId);

  const handleNavigateToCanvasClick = () => {
    if (!data?.id) {
      return;
    }
    openAssetCentricResourceItemInCanvas({ id: data?.id, type: 'file' });
  };

  useEffect(() => {
    return () => {
      if (isFetched && externalId) {
        setRecentlyVisited(data?.name, undefined, {
          externalId,
          dataType: 'file',
        });
      }
    };
  }, [isFetched]);

  return (
    <Page.Dashboard
      name={data?.name}
      dataType="File"
      loading={isLoading}
      renderActions={() => [
        <Dropdown.OpenIn
          onCanvasClick={handleNavigateToCanvasClick}
          disabled={isLoading}
        >
          <Button.OpenIn loading={isLoading} />
        </Dropdown.OpenIn>,
      ]}
    >
      <Page.Widgets>
        <FileWidget id="Preview" fileId={data?.id} rows={6} columns={4} />
        <PropertiesWidget
          id="Properties"
          state={status}
          data={data}
          columns={4}
        />
      </Page.Widgets>
    </Page.Dashboard>
  );
};
