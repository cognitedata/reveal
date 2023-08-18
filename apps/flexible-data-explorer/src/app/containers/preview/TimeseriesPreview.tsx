import React, { useState } from 'react';

import { Button } from '@cognite/cogs.js';
import { DEFAULT_DATE_RANGE } from '@cognite/plotting-components';

import { Dropdown } from '../../components/dropdown/Dropdown';
import { Spinner } from '../../components/loader/Spinner';
import { useNavigation } from '../../hooks/useNavigation';
import { useOpenIn } from '../../hooks/useOpenIn';
import { useTranslation } from '../../hooks/useTranslation';
import { useTimeseriesByIdQuery } from '../../services/instances/timeseries/queries/useTimeseriesByIdQuery';

import { Overview } from './containers/Overview';
import { PropertiesView } from './containers/PropertiesView';
import { TimeSeriesViewer } from './containers/Viewers/TimeSeriesViewer';
import {
  InstancePreviewContainer,
  InstancePreviewContent,
  InstancePreviewFooter,
  OpenButton,
} from './elements';
import { PreviewView } from './types';

interface Props {
  id: string | number;
}

export const TimeseriesPreview: React.FC<Props> = ({ id }) => {
  const { t } = useTranslation();
  const { toTimeseriesPage } = useNavigation();
  const { openAssetCentricResourceItemInCanvas, openInCharts } = useOpenIn();

  const { data, isLoading } = useTimeseriesByIdQuery(id);

  const [view, setView] = useState<PreviewView>();

  const handleOpenClick = () => {
    toTimeseriesPage(id);
  };

  const handleNavigateToCanvasClick = () => {
    openAssetCentricResourceItemInCanvas({ id: data?.id, type: 'timeSeries' });
  };

  const handleNavigateToChartsClick = () => {
    openInCharts(data?.id, DEFAULT_DATE_RANGE);
  };

  const renderContent = () => {
    if (isLoading) {
      return <Spinner />;
    }

    if (view === 'properties') {
      return <PropertiesView data={data} onClick={(item) => setView(item)} />;
    }

    return (
      <Overview
        type="Time series"
        title={data?.name || data?.externalId}
        description={data?.description}
        onClick={(item) => setView(item)}
      />
    );
  };

  return (
    <InstancePreviewContainer>
      <TimeSeriesViewer id={id} />

      <InstancePreviewContent>{renderContent()}</InstancePreviewContent>

      <InstancePreviewFooter>
        <Dropdown.OpenIn
          placement="top"
          onChartsClick={handleNavigateToChartsClick}
          onCanvasClick={handleNavigateToCanvasClick}
          disabled={isLoading}
        >
          <Button icon="EllipsisHorizontal" />
        </Dropdown.OpenIn>

        <OpenButton type="primary" onClick={handleOpenClick}>
          {t('GENERAL_OPEN')}
        </OpenButton>
      </InstancePreviewFooter>
    </InstancePreviewContainer>
  );
};
