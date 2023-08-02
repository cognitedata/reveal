import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Button } from '../../components/buttons/Button';
import { Dropdown } from '../../components/dropdown/Dropdown';
import { Page } from '../../containers/page/Page';
import { FileWidget, PropertiesWidget } from '../../containers/widgets';
import { useOpenIn } from '../../hooks/useOpenIn';
import { useRecentlyVisited } from '../../hooks/useRecentlyVisited';
import { useFileByIdQuery } from '../../services/instances/file/queries/useFileByIdQuery';

export const FilePage = () => {
  const { externalId } = useParams();
  const [, setRecentlyVisited] = useRecentlyVisited();
  const { openInCanvas } = useOpenIn();

  const { data, isLoading, isFetched } = useFileByIdQuery(externalId);

  const handleNavigateToCanvasClick = () => {
    openInCanvas({ id: data?.id, type: 'file' });
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
        <PropertiesWidget id="Properties" data={data} columns={4} />
        <FileWidget id="Preview" fileId={data?.id} rows={6} columns={4} />
      </Page.Widgets>
    </Page.Dashboard>
  );
};
