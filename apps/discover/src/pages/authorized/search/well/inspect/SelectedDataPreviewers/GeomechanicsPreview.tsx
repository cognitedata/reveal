import React from 'react';
import { useTranslation } from 'react-i18next';

import { WhiteLoader } from 'components/loading';
import {
  LOG_TRAJECTORY2D_PREVIEWS,
  LOG_WELLS_TRAJECTORY_NAMESPACE,
} from 'constants/logging';
import {
  useCreateMetricAndStartTimeLogger,
  useStopTimeLogger,
  TimeLogStages,
} from 'hooks/useTimeLog';
import { useSelectedWellBoresGeomechanic } from 'modules/wellSearch/selectors';
import { mapLogType } from 'modules/wellSearch/utils/common';

import { EMPTY_GEOMECHANICS_MESSAGE } from '../constants';
import { MessageWrapper } from '../modules/common/elements';
import { LogTypeViewer } from '../modules/logType/LogTypeViewer';

export const GeomechanicsPreview: React.FC = () => {
  const renderTimer = useCreateMetricAndStartTimeLogger(
    TimeLogStages.Render,
    LOG_TRAJECTORY2D_PREVIEWS,
    LOG_WELLS_TRAJECTORY_NAMESPACE
  );
  const { t } = useTranslation('WellData');
  const { geomechanics, isLoading } = useSelectedWellBoresGeomechanic();
  useStopTimeLogger(renderTimer);
  if (isLoading) {
    return <WhiteLoader />;
  }
  if (geomechanics.length === 0) {
    return <MessageWrapper>{t(EMPTY_GEOMECHANICS_MESSAGE)}</MessageWrapper>;
  }
  return <LogTypeViewer logTypes={mapLogType(geomechanics, 'geomechanic')} />;
};
