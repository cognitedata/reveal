import { Body, Colors, Flex, Icon } from '@cognite/cogs.js';

import { TranslationKeys, useTranslation } from 'common/i18n';
import { DataSetRow } from 'pages/DataSetsList/TableColumns';

type GovernanceStatusProps = {
  isGoverned: DataSetRow['quality'];
};

const GovernanceStatus = ({
  isGoverned,
}: GovernanceStatusProps): JSX.Element => {
  const { t } = useTranslation();

  let statusColor: string;
  let statusI18nKey: TranslationKeys;

  if (isGoverned) {
    statusColor = Colors['border--status-success--strong'];
    statusI18nKey = 'governed';
  } else if (isGoverned === false) {
    statusColor = Colors['border--status-critical--strong'];
    statusI18nKey = 'ungoverned';
  } else {
    statusColor = Colors['border--status-warning--strong'];
    statusI18nKey = 'not-defined';
  }

  return (
    <Flex alignItems="center" gap={8}>
      <Icon type="DotLarge" style={{ color: statusColor }} />
      <Body level={2}>{t(statusI18nKey)}</Body>
    </Flex>
  );
};

export default GovernanceStatus;
