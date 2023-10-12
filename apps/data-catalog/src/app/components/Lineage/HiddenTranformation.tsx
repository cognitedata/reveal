import { Flex, Icon, Tooltip } from '@cognite/cogs.js';

import { useTranslation } from '../../common/i18n';
import { TransformationDetails } from '../../utils/types';

interface HiddenTransformationProps {
  transformation: TransformationDetails;
}

const HiddenTransformation = ({
  transformation,
}: HiddenTransformationProps) => {
  const { t } = useTranslation();
  const message = (
    <div>
      {t('lineage-hidden-transformation-p1')}{' '}
      <strong>{transformation?.name}</strong>{' '}
      {t('lineage-hidden-transformation-p2')}
    </div>
  );
  return (
    <Flex alignItems="center" style={{ fontStyle: 'italic' }}>
      <Tooltip wrapped content={message}>
        <Icon
          type="WarningTriangle"
          css={{ cursor: 'help', marginRight: '4px', marginTop: '6px' }}
        />
      </Tooltip>
      {transformation?.name}
    </Flex>
  );
};

export default HiddenTransformation;
