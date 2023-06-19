import { DateFormat } from '@platypus/platypus-core';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { DateUtilsImpl } from '@platypus-app/utils/data';

import { Body, Flex, Icon, Title } from '@cognite/cogs.js';

type LastValidationTimeProps = {
  loading: boolean;
  validationTime?: Date;
};

export const LastValidationTime = ({
  loading,
  validationTime,
}: LastValidationTimeProps) => {
  const { t } = useTranslation('RulesTable');

  const dateUtils = new DateUtilsImpl();
  const formattedLastRunTime =
    validationTime &&
    dateUtils.format(validationTime, DateFormat.DISPLAY_DATETIME_FORMAT);

  if (loading)
    return <Icon aria-label="Loading last validation time" type="Loader" />;

  if (!formattedLastRunTime) return <></>;

  return (
    <Flex alignItems="center" direction="row" gap={6}>
      <Body level={6}>
        {t('data_quality_last_validation', 'Last Validation')}
      </Body>
      <Title level={5}>{formattedLastRunTime}</Title>
    </Flex>
  );
};
