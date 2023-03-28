import { Body, Flex } from '@cognite/cogs.js';

import { useTranslation } from 'common';

type ResourceNameProps = {
  resource?: Record<string, unknown>;
};

const ResourceName = ({ resource }: ResourceNameProps): JSX.Element => {
  const { t } = useTranslation();

  if (!!resource?.name && typeof resource.name === 'string') {
    return (
      <Flex direction="column">
        <Body level={3} muted>
          {t('name')}
        </Body>
        <Body level={2}>{resource.name}</Body>
      </Flex>
    );
  }

  if (!!resource?.externalId && typeof resource.externalId === 'string') {
    return (
      <Flex direction="column">
        <Body level={3} muted>
          {t('external-id')}
        </Body>
        <Body level={2}>{resource.externalId}</Body>
      </Flex>
    );
  }

  if (!!resource?.id && typeof resource.id === 'string') {
    return (
      <Flex direction="column">
        <Body level={3} muted>
          {t('id')}
        </Body>
        <Body level={2}>{resource.id}</Body>
      </Flex>
    );
  }

  return <>-</>;
};

export default ResourceName;
