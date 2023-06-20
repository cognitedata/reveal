import { useParams } from 'react-router-dom';

import { ResourceItem } from '@data-exploration-lib/core';

import { Button } from '../../components/buttons/Button';
import { Dropdown } from '../../components/dropdown/Dropdown';
import { Menu } from '../../components/menu/Menu';
import { Page } from '../../containers/page/Page';
import { FileWidget, PropertiesWidget } from '../../containers/widgets';
import { useNavigation } from '../../hooks/useNavigation';
import { useFileByIdQuery } from '../../services/instances/file/queries/useFileByIdQuery';

const FileActions = ({
  loading,
  onCanvasClick,
}: {
  loading?: boolean;
  onCanvasClick?: () => void;
}) => {
  return (
    <Dropdown
      placement="bottom-end"
      content={
        <Menu>
          {onCanvasClick && <Menu.OpenInCanvas onClick={onCanvasClick} />}
        </Menu>
      }
      disabled={false}
    >
      <Button.OpenIn loading={loading} />
    </Dropdown>
  );
};

export const FilePage = () => {
  const navigate = useNavigation();
  const { externalId } = useParams();

  const { data, isLoading } = useFileByIdQuery(externalId);

  const handleNavigateToCanvasClick = () => {
    if (data && data.id) {
      const file: ResourceItem = { id: data?.id, type: 'file', externalId };
      navigate.toCanvas(file);
    }
  };

  return (
    <Page.Dashboard
      customName={data?.name}
      customDataType="File"
      loading={isLoading}
      renderActions={() => [
        <FileActions
          loading={isLoading}
          onCanvasClick={handleNavigateToCanvasClick}
        />,
      ]}
    >
      <Page.Widgets>
        <FileWidget id="Preview" fileId={data?.id} rows={8} columns={2} />
        <PropertiesWidget id="Properties" data={data} columns={2} />
      </Page.Widgets>
    </Page.Dashboard>
  );
};
