import Spin from 'antd/lib/spin';
import { isOidcEnv } from 'utils/shared';
import { useCdfGroups } from 'actions';
import { CREATE_GROUP_ACCESS_DOC, ContentWrapper } from 'utils';
import Owners from './Owners';
import GroupsWithAccess from './GroupsWithAccess';
import { useTranslation } from 'common/i18n';
import { Body, Title } from '@cognite/cogs.js';

interface AccessControlProps {
  dataSetId: number;
  writeProtected: boolean;
}

const AccessControl = ({ dataSetId, writeProtected }: AccessControlProps) => {
  const { t } = useTranslation();
  const isOidc = isOidcEnv();

  const { groups = [], isLoading } = useCdfGroups();

  return (
    <ContentWrapper>
      <Spin spinning={isLoading}>
        {writeProtected && (
          <>
            <Title level={4}>
              {t('access-control-owners-of-this-data-set')}
            </Title>
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
      </Spin>
    </ContentWrapper>
  );
};

export default AccessControl;
