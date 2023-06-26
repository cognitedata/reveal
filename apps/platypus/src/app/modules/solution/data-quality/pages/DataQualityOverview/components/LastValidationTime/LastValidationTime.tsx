import { DateFormat } from '@platypus/platypus-core';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { DateUtilsImpl } from '@platypus-app/utils/data';

import { Body, Flex, Icon, Micro, Title } from '@cognite/cogs.js';
import { Datapoints } from '@cognite/sdk/dist/src';

type LastValidationTimeProps = {
  datapoints: Datapoints[];
  displayType?: 'bold' | 'muted';
  loading: boolean;
};

export const LastValidationTime = ({
  datapoints,
  displayType = 'bold',
  loading,
}: LastValidationTimeProps) => {
  const { t } = useTranslation('RulesTable');

  const lastValidationTime = getLastValidationTime(datapoints);

  const dateUtils = new DateUtilsImpl();
  const formattedLastRunTime =
    lastValidationTime &&
    dateUtils.format(lastValidationTime, DateFormat.DISPLAY_DATETIME_FORMAT);

  const lastValidation = t('data_quality_last_validation', 'Last Validation');

  if (loading)
    return <Icon aria-label="Loading last validation time" type="Loader" />;

  if (!formattedLastRunTime) return null;

  return (
    <Flex alignItems="center" direction="row" gap={6}>
      {displayType === 'muted' ? (
        <Micro muted>{`${lastValidation}: ${formattedLastRunTime}`}</Micro>
      ) : (
        <>
          <Body level={6}>{lastValidation}:</Body>
          <Title level={5}>{formattedLastRunTime}</Title>
        </>
      )}
    </Flex>
  );
};

/** Get the latest timestamp from a set of datapoints */
const getLastValidationTime = (tsDatapoints: Datapoints[]) => {
  return tsDatapoints[0]?.datapoints[0]?.timestamp;
};
