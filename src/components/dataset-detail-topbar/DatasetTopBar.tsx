import { ReactElement } from 'react';
import { Button, Flex, Title } from '@cognite/cogs.js';
import { createLink, getProject } from '@cognite/cdf-utilities';
import { trackEvent } from '@cognite/cdf-route-tracker';

import { useParams, useLocation, useNavigate } from 'react-router-dom';

import { DataSetV3, DATASET_HELP_DOC } from 'utils';
import styled from 'styled-components';

interface DatasetTopBarProps {
  dataset: DataSetV3 | undefined;
  actions?: ReactElement;
}

const DatasetTopBar = ({ dataset, actions }: DatasetTopBarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { appPath } = useParams<{ appPath?: string }>();

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
        <Title level="4">{dataset?.name}</Title>
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
