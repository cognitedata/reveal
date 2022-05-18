import {
  BasicInfoPane,
  PaneTitle,
  ItemLabel,
  ItemValue,
  NoDataText,
  ThinBorderLine,
  ApprovedDot,
  UnApprovedDot,
  LabelTag,
} from 'utils/styledComponents';
import moment from 'moment';
import { DataSet } from 'utils/types';
import Typography from 'antd/lib/typography';
import Tag from 'antd/lib/tag';
import WriteProtectedIcon from '../WriteProtectedIcon';
import InfoTooltip from '../InfoTooltip';
import { useTranslation } from 'common/i18n';

const { Text } = Typography;

interface BasicInfoCardProps {
  dataSet: DataSet;
}
const BasicInfoCard = ({ dataSet }: BasicInfoCardProps) => {
  const { t } = useTranslation();
  const {
    writeProtected,
    name,
    id,
    description,
    metadata,
    externalId,
    lastUpdatedTime,
  } = dataSet;

  const {
    consoleGoverned,
    consoleOwners = [],
    consoleLabels = [],
    consoleCreatedBy,
    archived = false,
  } = metadata;

  return (
    <BasicInfoPane>
      <PaneTitle>{t('basic-information')}</PaneTitle>
      <ItemLabel>{t('name')}</ItemLabel>{' '}
      <ItemValue>
        {writeProtected && <WriteProtectedIcon />}
        {name}
      </ItemValue>
      <ItemLabel>{t('data-set-id')}</ItemLabel>{' '}
      <InfoTooltip
        tooltipText={
          <span data-testid="id-tooltip">
            {t('basic-info-tooltip-data-set-id')}
          </span>
        }
        url="https://docs.cognite.com/cdf/data_governance/guides/datasets/create_data_sets.html#step-3a-ingest-new-data-into-the-data-set"
        urlTitle={t('learn-more-in-our-docs')}
        showIcon={false}
      >
        <Tag color="blue" style={{ marginBottom: '10px' }}>
          <Text copyable={{ text: String(id) }}>{id}</Text>
        </Tag>
      </InfoTooltip>
      <ItemLabel>{t('external-id')}</ItemLabel>
      <ItemValue>
        {externalId ? (
          <Typography.Paragraph ellipsis={{ rows: 1, expandable: true }}>
            {externalId}
          </Typography.Paragraph>
        ) : (
          <NoDataText>{t('external-id-no')}</NoDataText>
        )}
      </ItemValue>
      <ThinBorderLine />
      <ItemLabel>{t('description')}</ItemLabel>
      <ItemValue>
        <Typography.Paragraph ellipsis={{ rows: 2, expandable: true }}>
          {description}
        </Typography.Paragraph>
      </ItemValue>
      {metadata && (
        <>
          <ItemLabel>
            <InfoTooltip
              title={t('governance-status')}
              tooltipText={t('basic-info-tooltip-governance-status')}
              url="https://docs.cognite.com/cdf/data_governance/guides/datasets/edit_explore_data_sets.html#explore-data-sets"
              urlTitle={t('learn-more-in-our-docs')}
              showIcon={false}
            />
          </ItemLabel>
          <ItemValue>
            {consoleGoverned !== undefined ? (
              <>
                {consoleGoverned ? (
                  <>
                    <ApprovedDot />
                    {t('governed')}
                  </>
                ) : (
                  <span>
                    <UnApprovedDot />
                    {t('ungoverned')}
                  </span>
                )}
              </>
            ) : (
              <NoDataText>{t('quality-not-defined')}</NoDataText>
            )}
          </ItemValue>

          <ItemLabel>
            {t('owner')}
            {Array.isArray(consoleOwners) && consoleOwners.length > 1 && 's'}
          </ItemLabel>
          {Array.isArray(consoleOwners) && consoleOwners.length > 0 ? (
            consoleOwners.map((owner) => (
              <span key={owner.name}>
                <ItemValue>{owner.name}</ItemValue>
                <ItemValue>
                  <a href={`mailto:${owner.email}`}>{owner.email}</a>
                </ItemValue>
              </span>
            ))
          ) : (
            <NoDataText>{t('no-owners-set')}</NoDataText>
          )}
          <ItemLabel>{t('label_other')}</ItemLabel>
          <ItemValue>
            {Array.isArray(consoleLabels) && consoleLabels.length > 0 ? (
              <>
                {consoleLabels.map((tag) => (
                  <LabelTag key={tag}>{tag}</LabelTag>
                ))}
              </>
            ) : (
              <NoDataText>{t('no-labels-assigned')}</NoDataText>
            )}
          </ItemValue>
        </>
      )}
      <ThinBorderLine />
      <ItemLabel>{t('created-by')}</ItemLabel>
      <ItemValue>
        {consoleCreatedBy ? (
          <>{consoleCreatedBy.username}</>
        ) : (
          <NoDataText>{t('not-available')}</NoDataText>
        )}
      </ItemValue>
      <ItemLabel>{t('last-updated')}</ItemLabel>
      <ItemValue>{moment(lastUpdatedTime).calendar()}</ItemValue>
      {archived && (
        <InfoTooltip
          tooltipText={t('basic-info-tooltip-data-set-archived')}
          url="https://docs.cognite.com/cdf/data_governance/guides/datasets/edit_explore_data_sets.html"
          urlTitle={t('learn-more-in-our-docs')}
          showIcon={false}
        >
          <Tag color="red">{t('archived')}</Tag>
        </InfoTooltip>
      )}
    </BasicInfoPane>
  );
};

export default BasicInfoCard;
