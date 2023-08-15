import { useLocation, useParams } from 'react-router-dom';

import { Button } from '@cognite/cogs.js';

import { useSelectedDataModelVersion } from '../../../hooks/data-model-version/useSelectedDataModelVersion';
import { extractPropertiesFromURL } from '../../../utils/extractPropertiesFromURL';

export const ImproveYourScore = ({
  headerName,
  dataModelType,
}: {
  headerName: string;
  dataModelType: string;
}) => {
  const currentURL = window.location.href;
  const baseUrl = new URL(currentURL).origin;
  const { type } = extractPropertiesFromURL();
  const { dataModelExternalId = '', space = '', version = '' } = useParams();

  const {
    dataModelVersion: { version: versionNumber },
  } = useSelectedDataModelVersion(version, dataModelExternalId, space);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const cluster = searchParams.get('cluster') || '';
  const env = searchParams.get('env') || '';

  const queryParams = new URLSearchParams({
    cluster: cluster,
    env: env,
    dataModelExternalId: dataModelExternalId,
    space: space,
    version: versionNumber,
    type: type,
    headerName: headerName,
    dataModelType: dataModelType,
  });

  const AdvancedJoinsURL = `${baseUrl}/contextualization/explore/advancedJoins?${queryParams.toString()}`;

  return (
    <Button
      style={{
        width: '100%',
      }}
      type="primary"
      onClick={() => {
        window.location.href = AdvancedJoinsURL;
      }}
    >
      Improve your score
    </Button>
  );
};
