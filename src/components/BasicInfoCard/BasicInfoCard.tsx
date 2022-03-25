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

const { Text } = Typography;

interface BasicInfoCardProps {
  dataSet: DataSet;
}
const BasicInfoCard = ({ dataSet }: BasicInfoCardProps) => {
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
      <PaneTitle>Basic information</PaneTitle>
      <ItemLabel>Name</ItemLabel>{' '}
      <ItemValue>
        {writeProtected && <WriteProtectedIcon />}
        {name}
      </ItemValue>
      <ItemLabel>Data set ID</ItemLabel>{' '}
      <InfoTooltip
        tooltipText={
          <span data-testid="id-tooltip">
            Use this data set ID to attach data objects to this data set through
            the API
          </span>
        }
        url="https://docs.cognite.com/cdf/data_governance/guides/datasets/create_data_sets.html#step-3a-ingest-new-data-into-the-data-set"
        urlTitle="Learn more in our docs."
        showIcon={false}
      >
        <Tag color="blue" style={{ marginBottom: '10px' }}>
          {' '}
          <Text copyable={{ text: String(id) }}>{id}</Text>
        </Tag>
      </InfoTooltip>
      <ItemLabel>External ID</ItemLabel>{' '}
      <ItemValue>
        {externalId ? (
          <Typography.Paragraph ellipsis={{ rows: 1, expandable: true }}>
            {externalId}
          </Typography.Paragraph>
        ) : (
          <NoDataText>No external ID</NoDataText>
        )}
      </ItemValue>
      <ThinBorderLine />
      <ItemLabel>Description</ItemLabel>
      <ItemValue>
        <Typography.Paragraph ellipsis={{ rows: 2, expandable: true }}>
          {description}
        </Typography.Paragraph>
      </ItemValue>
      {metadata && (
        <>
          <ItemLabel>
            <InfoTooltip
              title="Governance status"
              tooltipText="Governed indicates that the data set has a designated owner and follows the governance processes for data in your organization."
              url="https://docs.cognite.com/cdf/data_governance/guides/datasets/edit_explore_data_sets.html#explore-data-sets"
              urlTitle="Learn more in our docs."
              showIcon={false}
            />
          </ItemLabel>
          <ItemValue>
            {consoleGoverned !== undefined ? (
              <>
                {consoleGoverned ? (
                  <>
                    <ApprovedDot />
                    Governed
                  </>
                ) : (
                  <span>
                    <UnApprovedDot />
                    Ungoverned
                  </span>
                )}
              </>
            ) : (
              <NoDataText>Quality has not been defined</NoDataText>
            )}
          </ItemValue>

          <ItemLabel>
            Owner
            {Array.isArray(consoleOwners) && consoleOwners.length > 1 && 's'}
          </ItemLabel>
          {Array.isArray(consoleOwners) && consoleOwners.length > 0 ? (
            consoleOwners.map((owner) => (
              <span key={owner.name}>
                <ItemValue>{owner.name}</ItemValue>
                <ItemValue>
                  {' '}
                  <a href={`mailto:${owner.email}`}>{owner.email}</a>
                </ItemValue>
              </span>
            ))
          ) : (
            <NoDataText>No owners set</NoDataText>
          )}
          <ItemLabel>Labels</ItemLabel>
          <ItemValue>
            {Array.isArray(consoleLabels) && consoleLabels.length > 0 ? (
              <>
                {consoleLabels.map((tag) => (
                  <LabelTag key={tag}>{tag}</LabelTag>
                ))}
              </>
            ) : (
              <NoDataText>Not labels assigned</NoDataText>
            )}
          </ItemValue>
        </>
      )}
      <ThinBorderLine />
      <ItemLabel>Created by</ItemLabel>
      <ItemValue>
        {consoleCreatedBy ? (
          <>{consoleCreatedBy.username}</>
        ) : (
          <NoDataText>Not available</NoDataText>
        )}
      </ItemValue>
      <ItemLabel>Last updated</ItemLabel>
      <ItemValue>{moment(lastUpdatedTime).calendar()}</ItemValue>
      {archived && (
        <InfoTooltip
          tooltipText="This data set has been archived which means it is hidden from the UI by default but can still be accessed through the api."
          url="https://docs.cognite.com/cdf/data_governance/guides/datasets/edit_explore_data_sets.html"
          urlTitle="Learn more in our docs."
          showIcon={false}
        >
          <Tag color="red">Archived</Tag>
        </InfoTooltip>
      )}
    </BasicInfoPane>
  );
};

export default BasicInfoCard;
