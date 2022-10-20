import Typography from 'antd/lib/typography';
import { Body, Flex, Icon, Label } from '@cognite/cogs.js';
import { notification } from 'antd';
import {
  BasicInfoPane,
  NoDataText,
  SimpleLabel,
  DataSet,
  CREATE_DATASET_DOC,
  EDIT_DATASET_DOC,
  EDIT_DATASET_HELP_DOC,
  getGovernedStatus,
} from 'utils';
import copy from 'copy-to-clipboard';

import { useTranslation } from 'common/i18n';
import moment from 'moment';
import DatasetProperty from './DatasetProperty';
import { TabbableButton } from 'components/tabbable-button';
import styled from 'styled-components';
import InfoTooltip from 'components/InfoTooltip';
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

  const { statusVariant, statusI18nKey } = getGovernedStatus(consoleGoverned);

  const handleCopy = (copiedText: string) => {
    copy(copiedText);
    notification.success({
      message: t('copy-notification'),
    });
  };

  return (
    <BasicInfoPane>
      <DatasetProperty
        label={
          <Body level={2} className="mute">
            {t('name')}
          </Body>
        }
        value={
          <Flex gap={8} alignItems="center">
            {writeProtected && <Icon type="Lock" />}
            <Body level={1} strong>
              {name}
            </Body>
            <TabbableButton
              aria-label={t('copy-name')}
              onClick={() => handleCopy(name)}
            >
              <Icon type="Copy" />
            </TabbableButton>
          </Flex>
        }
      />
      <DatasetProperty
        label={
          <Body level={2} className="mute">
            {t('description')}
          </Body>
        }
        value={
          <Body level={1} strong>
            <Typography.Paragraph
              ellipsis={{ rows: 2, expandable: true }}
              style={{ margin: 0 }}
            >
              {description}
            </Typography.Paragraph>
          </Body>
        }
      />
      <DatasetProperty
        label={
          <Flex gap={6} direction="row" alignItems="center">
            <Body level={2} className="mute">
              {t('data-set-id')}
            </Body>
            <InfoTooltip
              tooltipText={
                <span data-testid="id-tooltip">
                  {t('basic-info-tooltip-data-set-id')}{' '}
                </span>
              }
              url={CREATE_DATASET_DOC}
              urlTitle={t('learn-more-in-our-docs')}
              showIcon={false}
            >
              <HelpIcon type="Help" />
            </InfoTooltip>
          </Flex>
        }
        value={
          <Flex gap={8} alignItems="center">
            <Body level={1} strong>
              {id}
            </Body>
            <TabbableButton
              aria-label={t('copy-dataset-id')}
              onClick={() => handleCopy(id.toString())}
            >
              <Icon type="Copy" />
            </TabbableButton>
          </Flex>
        }
      />
      <DatasetProperty
        label={
          <Body level={2} className="mute">
            {t('external-id')}
          </Body>
        }
        value={
          externalId ? (
            <Flex gap={8} alignItems="center">
              <Body level={1} strong>
                {externalId}
              </Body>
              <TabbableButton
                aria-label={t('copy-external-id')}
                onClick={() => handleCopy(externalId)}
              >
                <Icon type="Copy" />
              </TabbableButton>
            </Flex>
          ) : (
            <NoDataText>{t('external-id-no')}</NoDataText>
          )
        }
      />
      {metadata && (
        <>
          <DatasetProperty
            label={
              <Flex gap={6} direction="row" alignItems="center">
                <Body level={2} className="mute">
                  {t('governance-status')}
                </Body>
                <InfoTooltip
                  tooltipText={
                    <span data-testid="id-tooltip">
                      {t('basic-info-tooltip-governance-status')}{' '}
                    </span>
                  }
                  url={EDIT_DATASET_DOC}
                  urlTitle={t('learn-more-in-our-docs')}
                  showIcon={false}
                >
                  <HelpIcon type="Help" />
                </InfoTooltip>
              </Flex>
            }
            value={
              <div>
                <Label size="medium" variant={statusVariant}>
                  {t(statusI18nKey)}
                </Label>
              </div>
            }
          />
          <DatasetProperty
            label={
              <Body level={2} className="mute">
                {consoleOwners?.length ? t('owner') : t('owner_other')}
              </Body>
            }
            value={
              consoleOwners?.length ? (
                consoleOwners.map((owner) => (
                  <div key={owner.name}>
                    <Body level={1} strong>
                      {owner.name}
                    </Body>
                    <Flex gap={8} alignItems="center">
                      <Body level={1} strong>
                        <a href={`mailto:${owner.email}`}>{owner.email}</a>
                      </Body>
                      <TabbableButton
                        aria-label={t('copy-owner-email')}
                        onClick={() => handleCopy(owner.email)}
                      >
                        <Icon type="Copy" />
                      </TabbableButton>
                    </Flex>
                  </div>
                ))
              ) : (
                <NoDataText>{t('no-owners-set')}</NoDataText>
              )
            }
          />

          <DatasetProperty
            label={
              <Body level={2} className="mute">
                {t('label_other')}
              </Body>
            }
            value={
              consoleLabels?.length ? (
                <Flex gap={6} alignItems="center" direction="row" wrap="wrap">
                  {consoleLabels.map((tag) => (
                    <SimpleLabel size="medium" variant="default">
                      {tag}
                    </SimpleLabel>
                  ))}
                </Flex>
              ) : (
                <NoDataText>{t('no-labels-assigned')}</NoDataText>
              )
            }
          />
        </>
      )}

      <DatasetProperty
        label={
          <Body level={2} className="mute">
            {t('created-by')}
          </Body>
        }
        value={
          consoleCreatedBy ? (
            consoleCreatedBy.username
          ) : (
            <NoDataText>{t('not-available')}</NoDataText>
          )
        }
      />

      <DatasetProperty
        label={
          <Body level={2} className="mute">
            {t('last-updated')}
          </Body>
        }
        value={moment(lastUpdatedTime).calendar()}
      />

      {archived && (
        <DatasetProperty
          value={
            <Flex gap={6} direction="row" alignItems="center">
              <InfoTooltip
                tooltipText={
                  <span data-testid="id-tooltip">
                    {t('basic-info-tooltip-data-set-archived')}{' '}
                  </span>
                }
                url={EDIT_DATASET_HELP_DOC}
                urlTitle={t('learn-more-in-our-docs')}
                showIcon={false}
              >
                <Label size="medium" variant="danger">
                  {t('archived')}
                </Label>
              </InfoTooltip>
            </Flex>
          }
        />
      )}
    </BasicInfoPane>
  );
};

const HelpIcon = styled(Icon)`
  margin-top: 3px;
`;

export default BasicInfoCard;
