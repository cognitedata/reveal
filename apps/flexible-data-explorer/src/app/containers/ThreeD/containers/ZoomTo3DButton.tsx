import styled from 'styled-components';

import { Button } from '@cognite/cogs.js';

import { Spinner } from '../../../components/loader/Spinner';
import { useSelectedInstanceParams } from '../../../hooks/useParams';
import { useTranslation } from '../../../hooks/useTranslation';
import { useInstanceThreeDEntryQuery } from '../../../services/instances/generic/hooks/useInstanceThreeD';
import { Instance } from '../../../services/types';

export const ZoomTo3DButton = ({
  selectedInstance,
  is3dMapped,
  onZoomButtonClick,
}: {
  selectedInstance: Instance;
  is3dMapped?: boolean;
  onZoomButtonClick?: (value: Instance | undefined) => void;
}) => {
  const [, setSelectedInstance] = useSelectedInstanceParams();
  const { t } = useTranslation();

  const { externalId, instanceSpace, dataType } = selectedInstance;

  const { data, isFetching, isInitialLoading } = useInstanceThreeDEntryQuery({
    externalId,
    instanceSpace,
    dataType,
  });

  const isDataLoading = isFetching && isInitialLoading;

  if (isDataLoading && !is3dMapped) {
    return <Spinner />;
  }

  const isDataEmpty = data.items.length === 0 && data.edges.length === 0;

  if (isDataEmpty && !isDataLoading && !is3dMapped) {
    return (
      <StyledButton type="ghost" disabled>
        {t('SEARCH_RESULTS_3D_NOT_3D_MAPPED_TEXT')}
      </StyledButton>
    );
  }

  return (
    <Button
      onClick={(event) => {
        event.stopPropagation();
        event.preventDefault();

        setSelectedInstance({ externalId, instanceSpace, dataType });

        onZoomButtonClick?.(selectedInstance);
      }}
      type="ghost"
      icon="ZoomIn"
    >
      {t('SEARCH_RESULTS_3D_ZOOM_IN_BUTTON')}
    </Button>
  );
};

const StyledButton = styled(Button)`
  width: 130px;
`;
