import Spin from 'antd/lib/spin';
import { isOidcEnv } from 'utils/shared';
import { useCdfGroups } from 'actions';
import { TitleOrnament, MiniInfoTitle } from 'utils/styledComponents';
import Owners from './Owners';
import GroupsWithAccess from './GroupsWithAccess';
import { useTranslation } from 'common/i18n';

interface AccessControlProps {
  dataSetId: number;
  writeProtected: boolean;
}

const AccessControl = ({ dataSetId, writeProtected }: AccessControlProps) => {
  const { t } = useTranslation();
  const isOidc = isOidcEnv();

  const { groups = [], isLoading } = useCdfGroups();

  return (
    <Spin spinning={isLoading}>
      {writeProtected && (
        <>
          <MiniInfoTitle style={{ marginTop: '20px' }}>
            {t('access-control-owners-of-this-data-set')}
          </MiniInfoTitle>
          <TitleOrnament />
          <p>{t('access-control-p1')}</p>
          <Owners dataSetId={dataSetId} groups={groups} isOidcEnv={isOidc} />
        </>
      )}
      <MiniInfoTitle style={{ marginTop: '20px' }}>
        {t('access-control-groups-with-access-scoped')}
      </MiniInfoTitle>
      <TitleOrnament />
      <GroupsWithAccess
        dataSetId={dataSetId}
        groups={groups ?? []}
        isOidcEnv={isOidc}
      />
      <p style={{ marginTop: '20px' }}>
        {t('access-control-p2')}
        <a
          href="https://docs.cognite.com/cdf/access/guides/create_groups.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('access-control-learn-more-about-scoping')}
        </a>
      </p>
    </Spin>
  );
};

export default AccessControl;
