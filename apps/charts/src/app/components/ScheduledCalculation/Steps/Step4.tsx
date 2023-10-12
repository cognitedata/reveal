import { Flex, Title, Button } from '@cognite/cogs.js';

import { useTranslations } from '../../../hooks/translations';
import { makeDefaultTranslations } from '../../../utils/translations';
import { ThumbsUpAgree } from '../../Icons/ThumbsUpAgree';

import { CenterAlignedBody } from './elements';

const defaultTranslations = makeDefaultTranslations(
  'Scheduled calculation created',
  'The calculated result will be discoverable as time series and can be found by external ID',
  'Ok, I understand'
);

export const Step4Body = ({ onClose }: { onClose: () => void }) => {
  const t = {
    ...defaultTranslations,
    ...useTranslations(Object.keys(defaultTranslations), 'ScheduledCalculation')
      .t,
  };

  return (
    <Flex justifyContent="center">
      <Flex
        gap={8}
        direction="column"
        alignItems="center"
        style={{ width: '367px' }}
      >
        <ThumbsUpAgree />
        <Title level={5}>{t['Scheduled calculation created']}</Title>
        <CenterAlignedBody level={5}>
          {
            t[
              'The calculated result will be discoverable as time series and can be found by external ID'
            ]
          }
        </CenterAlignedBody>
        <Button onClick={onClose} type="primary">
          {t['Ok, I understand']}
        </Button>
      </Flex>
    </Flex>
  );
};
