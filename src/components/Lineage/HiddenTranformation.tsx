import { Flex, Icon } from '@cognite/cogs.js';
import Popover from 'antd/lib/popover';
import { useTranslation } from 'common/i18n';
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
      <Popover
        content={message}
        overlayStyle={{ width: '300px' }}
        placement="left"
      >
        <Icon
          type="WarningTriangle"
          style={{ cursor: 'help', marginRight: '4px' }}
        />
      </Popover>
      {transformation?.name}
    </Flex>
  );
};

export default HiddenTransformation;
