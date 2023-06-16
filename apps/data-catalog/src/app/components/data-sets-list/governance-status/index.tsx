import { useTranslation } from '@data-catalog-app/common/i18n';
import { DataSetRow } from '@data-catalog-app/pages/DataSetsList/TableColumns';
import { getGovernedStatus } from '@data-catalog-app/utils';

import { Body, Flex, Icon } from '@cognite/cogs.js';

type GovernanceStatusProps = {
  isGoverned: DataSetRow['quality'];
};

const GovernanceStatus = ({
  isGoverned,
}: GovernanceStatusProps): JSX.Element => {
  const { t } = useTranslation();
  const { statusColor, statusI18nKey } = getGovernedStatus(isGoverned);

  return (
    <Flex alignItems="center" gap={8}>
      <Icon type="DotLarge" css={{ color: statusColor }} />
      <Body level={2}>{t(statusI18nKey)}</Body>
    </Flex>
  );
};

export default GovernanceStatus;
