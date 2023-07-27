import { useMemo } from 'react';

import { Button, Flex } from '@cognite/cogs.js';

import { GeneralDetails } from '../../../components/details';
import { useTranslation } from '../../../hooks/useTranslation';
import { flattenProperties } from '../../widgets/Properties/utils';
import { InstancePreviewHeader, TitleText } from '../elements';
import { InstancePreviewProps } from '../types';

interface Props extends InstancePreviewProps {
  data?: Record<string, any>;
}

export const PropertiesView: React.FC<Props> = ({ data, onClick }) => {
  const { t } = useTranslation();

  const properties = useMemo(() => flattenProperties(data), [data]);

  return (
    <>
      <InstancePreviewHeader>
        <Flex alignItems="center" gap={8}>
          <Button icon="ArrowLeft" onClick={() => onClick?.()} />
          <TitleText>{t('PREVIEW_CARD_PROPERTIES_TITLE')}</TitleText>
        </Flex>
      </InstancePreviewHeader>

      <GeneralDetails>
        {properties.map(({ key, value }) => {
          return (
            <GeneralDetails.Item
              key={key}
              name={key}
              value={value}
              hideCopyButton
            />
          );
        })}
      </GeneralDetails>
    </>
  );
};
