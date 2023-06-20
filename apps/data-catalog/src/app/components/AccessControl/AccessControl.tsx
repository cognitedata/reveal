import { useCdfGroups } from '@data-catalog-app/actions';
import { useTranslation } from '@data-catalog-app/common/i18n';
import {
  CREATE_GROUP_ACCESS_DOC,
  ContentWrapper,
  LoaderWrapper,
} from '@data-catalog-app/utils';
import { isOidcEnv } from '@data-catalog-app/utils/shared';

import { Body, Icon, Title } from '@cognite/cogs.js';

import GroupsWithAccess from './GroupsWithAccess';
import Owners from './Owners';

interface AccessControlProps {
  dataSetId: number;
  writeProtected: boolean;
}

const AccessControl = ({ dataSetId, writeProtected }: AccessControlProps) => {
  const { t } = useTranslation();
  const isOidc = isOidcEnv();

  const { groups = [], isLoading } = useCdfGroups();

  if (isLoading) {
    return (
      <LoaderWrapper>
        <Icon size={32} type="Loader" />
      </LoaderWrapper>
    );
  }

  return (
    <ContentWrapper>
      {writeProtected && (
        <>
          <Title level={4}>{t('access-control-owners-of-this-data-set')}</Title>
          <Body level={2}>{t('access-control-p1')}</Body>
          <Owners dataSetId={dataSetId} groups={groups} isOidcEnv={isOidc} />
          <br />
        </>
      )}
      <Title level={4}>{t('access-control-groups-with-access-scoped')}</Title>
      <GroupsWithAccess
        dataSetId={dataSetId}
        groups={groups ?? []}
        isOidcEnv={isOidc}
      />
      <Body level={2}>
        {t('access-control-p2')}{' '}
        <a
          href={CREATE_GROUP_ACCESS_DOC}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('access-control-learn-more-about-scoping')}
        </a>
      </Body>
    </ContentWrapper>
  );
};

export default AccessControl;
