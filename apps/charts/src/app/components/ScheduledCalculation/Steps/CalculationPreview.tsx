/**
 * Calculation Preview
 */

import { memo, useMemo } from 'react';

import { isBefore, sub } from 'date-fns';

import { Icon } from '@cognite/cogs.js';

import { useGetWorkflow } from '../../../domain/chart/internal/queries/useGetWorkflow';
import { useCalculationPreviewData } from '../../../domain/scheduled-calculation/service/queries/useCalculationPreviewData';
import { useTranslations } from '../../../hooks/translations';
import { makeDefaultTranslations } from '../../../utils/translations';
import PlotlyChart from '../../PlotlyChart/PlotlyChart';

import { PreviewStatus } from './elements';

const defaultTranslations = makeDefaultTranslations(
  "Invalid date range, run duration can't be 0",
  'No data points to display',
  'The calculation will run on aggregates'
);

type Props = {
  workflowId: string;
  period: {
    length: number;
    type: string;
  };
};

export const CalculationPreview = memo(({ workflowId, period }: Props) => {
  const workflow = useGetWorkflow(workflowId);
  const now = useMemo(() => new Date(), []);
  const { length, type } = period;

  const dateFrom = useMemo(
    () => sub(now, { [type]: length }).toISOString(),
    [type, length]
  );
  const dateTo = now.toISOString();

  const { data, isLoading, isError, error } = useCalculationPreviewData(
    workflowId,
    dateFrom,
    dateTo
  );

  const t = {
    ...defaultTranslations,
    ...useTranslations(Object.keys(defaultTranslations), 'ScheduledCalculation')
      .t,
  };

  const hasValidDates = isBefore(new Date(dateFrom), new Date(dateTo));

  if (!hasValidDates)
    return (
      <PreviewStatus $variant="warning">
        <Icon type="WarningFilled" />
        {t["Invalid date range, run duration can't be 0"]}
      </PreviewStatus>
    );

  if (isError)
    return (
      <PreviewStatus $variant="danger">
        <Icon type="ErrorFilled" />
        {(error as unknown as { message?: string })?.message}
      </PreviewStatus>
    );

  const plotProps: React.ComponentProps<typeof PlotlyChart> = {
    dateFrom,
    dateTo,
    calculations: !isLoading ? [workflow!] : [],
    calculationsData: !isLoading && data ? [data] : [],
    mergeUnits: true,
    isMinMaxShown: false,
    isYAxisShown: true,
    isPreview: true,
    isGridlinesShown: true,
  };

  return (
    <>
      {isLoading && <Icon type="Loader" />}

      {data && data.datapoints.length <= 0 && (
        <PreviewStatus $variant="danger">
          <Icon type="ErrorFilled" />
          {t['No data points to display']}
        </PreviewStatus>
      )}

      {data && data.datapoints.length && data.isDownsampled ? (
        <PreviewStatus $variant="warning">
          <Icon type="WarningFilled" />
          {t['The calculation will run on aggregates']}
        </PreviewStatus>
      ) : null}

      {data && data.datapoints.length && !data.isDownsampled ? (
        <PreviewStatus $variant="success">
          <Icon type="Checkmark" />
        </PreviewStatus>
      ) : null}

      <PlotlyChart {...plotProps} />
    </>
  );
});
