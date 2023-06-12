import { isOidcEnv } from 'utils/shared';
import { useCdfGroups } from 'actions';
import { CREATE_GROUP_ACCESS_DOC, ContentWrapper, LoaderWrapper } from 'utils';
import Owners from './Owners';
import GroupsWithAccess from './GroupsWithAccess';
import { useTranslation } from 'common/i18n';
import { Body, Icon, Title } from '@cognite/cogs.js';

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
