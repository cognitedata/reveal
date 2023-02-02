import { Body, Flex, Icon } from '@cognite/cogs.js';

import { useTranslation } from 'common/i18n';
import { DataSetRow } from 'pages/DataSetsList/TableColumns';
import { getGovernedStatus } from 'utils';

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
      <Icon type="DotLarge" style={{ color: statusColor }} />
      <Body level={2}>{t(statusI18nKey)}</Body>
    </Flex>
  );
};

export default GovernanceStatus;
