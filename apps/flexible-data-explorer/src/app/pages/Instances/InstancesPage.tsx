import { useParams } from 'react-router-dom';
import { Page } from '../../components/page/Page';
import { Button } from '../../components/buttons/Button';
import { PropertiesWidget } from '../../containers/widgets/Properties/PropertiesWidget';
import { useInstancesQuery } from '../../services/instances/queries/useInstanceByIdQuery';

export const InstancesPage = () => {
  const { dataType, externalId } = useParams();

  const { isLoading } = useInstancesQuery();

  return (
    <Page>
      <Page.Header title={externalId} subtitle={dataType} loading={isLoading}>
        <Button.OpenIn />
        <Button.Favorite />
      </Page.Header>

      <Page.Body loading={isLoading}>
        <Page.Dashboard>
          <PropertiesWidget id="t" />
        </Page.Dashboard>
      </Page.Body>
    </Page>
  );
};
