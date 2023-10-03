import styled from 'styled-components';

import moment from 'moment';

import { CopyButton } from '@cognite/cdf-utilities';
import { Body, Flex, Icon, Chip } from '@cognite/cogs.js';

import { useTranslation } from '../../common/i18n';
import {
  BasicInfoPane,
  CREATE_DATASET_DOC,
  DataSet,
  EDIT_DATASET_DOC,
  EDIT_DATASET_HELP_DOC,
  getGovernedStatus,
  NoDataText,
} from '../../utils';
import InfoTooltip from '../InfoTooltip';

import DatasetProperty from './DatasetProperty';

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

  return (
    <BasicInfoPane>
      <DatasetProperty
        label={
          <Body level={2} className="mute">
            {t('name')}
          </Body>
        }
        value={
          <Flex gap={8} alignItems="center" justifyContent="space-between">
            <Flex gap={8} alignItems="center">
              {writeProtected && <Icon type="Lock" />}
              <Body level={1}>{name}</Body>
            </Flex>
            <CopyButton aria-label={t('copy-name')} content={name} />
          </Flex>
        }
      />
      <DatasetProperty
        label={
          <Body level={2} className="mute">
            {t('description')}
          </Body>
        }
        value={<TruncatedText level={1}>{description}</TruncatedText>}
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
          <Flex gap={8} alignItems="center" justifyContent="space-between">
            <Body level={1}>{id}</Body>
            <CopyButton
              aria-label={t('copy-dataset-id')}
              content={id.toString()}
            />
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
            <Flex gap={8} alignItems="center" justifyContent="space-between">
              <Body level={1}>{externalId}</Body>
              <CopyButton
                aria-label={t('copy-external-id')}
                content={externalId}
              />
            </Flex>
          ) : (
            <NoDataText className="mute">{t('external-id-no')}</NoDataText>
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
                <Chip
                  size="medium"
                  type={statusVariant}
                  label={t(statusI18nKey)}
                />
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
                    <Flex alignItems="center" justifyContent="space-between">
                      <Flex direction="column" justifyContent="flex-start">
                        <Body level={1}>{owner.name}</Body>
                        <Body level={1}>
                          <a href={`mailto:${owner.email}`}>{owner.email}</a>
                        </Body>
                      </Flex>
                      <CopyButton
                        aria-label={t('copy-owner-email')}
                        content={owner.email}
                      />
                    </Flex>
                  </div>
                ))
              ) : (
                <NoDataText className="mute">{t('no-owners-set')}</NoDataText>
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
                    <Chip size="medium" type="default" label={tag} />
                  ))}
                </Flex>
              ) : (
                <NoDataText className="mute">
                  {t('no-labels-assigned')}
                </NoDataText>
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
            <Body level={1}>{consoleCreatedBy.username}</Body>
          ) : (
            <NoDataText className="mute">{t('not-available')}</NoDataText>
          )
        }
      />

      <DatasetProperty
        label={
          <Body level={2} className="mute">
            {t('last-updated')}
          </Body>
        }
        value={<Body level={1}>{moment(lastUpdatedTime).calendar()}</Body>}
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
                <Chip size="medium" type="danger" label={t('archived')} />
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

const TruncatedText = styled(Body)`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export default BasicInfoCard;
