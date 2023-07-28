import React, { useState } from 'react';

import { TimeseriesChart } from '@cognite/plotting-components';

import { Spinner } from '../../components/loader/Spinner';
import { useNavigation } from '../../hooks/useNavigation';
import { useTranslation } from '../../hooks/useTranslation';
import { useTimeseriesByIdQuery } from '../../services/instances/timeseries/queries/useTimeseriesByIdQuery';
import { isNumeric } from '../../utils/number';

import { Overview } from './containers/Overview';
import { PropertiesView } from './containers/PropertiesView';
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

const getTimeseriesId = (id: string | number) => {
  if (typeof id === 'number' || isNumeric(id)) {
    return { id: Number(id) };
  }

  return { externalId: id };
};

export const TimeseriesPreview: React.FC<Props> = ({ id }) => {
  const { t } = useTranslation();
  const { toTimeseriesPage } = useNavigation();

  const { data, isLoading } = useTimeseriesByIdQuery(id);

  const [view, setView] = useState<PreviewView>();

  const handleOpenClick = () => {
    toTimeseriesPage(id);
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
      <TimeseriesChart
        timeseries={getTimeseriesId(id)}
        variant="small"
        numberOfPoints={100}
        height={140}
        styles={{
          width: 300,
        }}
        dataFetchOptions={{
          mode: 'aggregate',
        }}
        autoRange
      />
      <InstancePreviewContent>{renderContent()}</InstancePreviewContent>

      <InstancePreviewFooter>
        <OpenButton type="primary" onClick={handleOpenClick}>
          {t('GENERAL_OPEN')}
        </OpenButton>
      </InstancePreviewFooter>
    </InstancePreviewContainer>
  );
};
