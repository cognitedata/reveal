import { ReactElement } from 'react';
import { Button, Flex, Label, Title } from '@cognite/cogs.js';
import { createLink, getProject } from '@cognite/cdf-utilities';
import { trackEvent } from '@cognite/cdf-route-tracker';

import { useParams, useLocation, useNavigate } from 'react-router-dom';

import {
  DataSet,
  DATASET_HELP_DOC,
  getGovernedStatus,
  SimpleLabel,
} from 'utils';
import styled from 'styled-components';
import { useTranslation } from 'common/i18n';

interface DatasetTopBarProps {
  dataset: DataSet;
  actions?: ReactElement;
}

const DatasetTopBar = ({ dataset, actions }: DatasetTopBarProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { appPath } = useParams<{ appPath?: string }>();

  const { metadata } = dataset;
  const { consoleGoverned: isGoverned, consoleLabels } = metadata;
  const { statusVariant, statusI18nKey } = getGovernedStatus(isGoverned);

  const handleGoToDatasets = () => {
    if (location.key === 'default') {
      navigate(createLink(`/${appPath}`));
    } else {
      navigate(-1);
    }
  };

  return (
    <TopBarWrapper justifyContent="space-between">
      <Flex alignItems="center" gap={8}>
        <Button
          icon="ArrowLeft"
          onClick={handleGoToDatasets}
          type="secondary"
        />
        <Title level="4">{dataset?.name || dataset?.externalId}</Title>
        <Label size="medium" variant={statusVariant}>
          {t(statusI18nKey)}
        </Label>
        {consoleLabels?.length ? (
          <Flex gap={4} alignItems="center" direction="row">
            <SimpleLabel size="medium" variant="default">
              {consoleLabels[0]}
            </SimpleLabel>
            {consoleLabels.length > 1 && (
              <SimpleLabel size="medium" variant="default">
                {`+${consoleLabels.length - 1}`}
              </SimpleLabel>
            )}
          </Flex>
        ) : (
          <></>
        )}
      </Flex>
      <Flex alignItems="center" gap={8}>
        {actions}
        <Button
          icon="Help"
          type="ghost"
          href={DATASET_HELP_DOC}
          target="_blank"
          onClick={() => {
            trackEvent('Applications.OperationSupport.Assets.Clicked help', {
              url: DATASET_HELP_DOC,
              projectName: getProject(),
            });
          }}
        />
      </Flex>
    </TopBarWrapper>
  );
};

const TopBarWrapper = styled(Flex)`
  padding: 10px;
`;

export default DatasetTopBar;
