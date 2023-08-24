import { useState } from 'react';

import styled from 'styled-components';

import sdk from '@cognite/cdf-sdk-singleton';
import { Tooltip, Dropdown } from '@cognite/cogs.js';
import { SDKProvider } from '@cognite/sdk-provider';

import { useCurrentView } from '../../hooks/models/useCurrentView';
import { useMeasureMappedPercentages } from '../../hooks/useMeasureMappedPercentages';

import { ContextualizationScoreInfoPanel } from './ContextualizationScoreInfoPanel';
import { PercentageChip } from './tabs/PercentageChip';

export const ContextualizationScore = ({
  headerName,
  dataModelType,
}: {
  headerName: string;
  dataModelType: string;
}) => {
  return (
    <SDKProvider sdk={sdk}>
      <ContextualizationScoreWrapper
        headerName={headerName}
        dataModelType={dataModelType}
      />
    </SDKProvider>
  );
};

const ContextualizationScoreWrapper = ({
  headerName,
  dataModelType,
}: {
  headerName: string;
  dataModelType: string;
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const view = useCurrentView();

  const { mappedPercentageJobStatus, mappedPercentage } =
    useMeasureMappedPercentages(
      view?.externalId,
      view?.space,
      view?.version,
      headerName
    );

  const handleOpen = () => {
    setIsOpen(true);
  };
  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <ContextualizationScoreButton
      appendTo={document.getElementById('dataPreviewTableWrapper')!}
      visible={isOpen}
      onClickOutside={handleClose}
      content={
        <ContextualizationScoreInfoPanel
          headerName={headerName}
          dataModelType={dataModelType}
          mappedPercentageJobStatus={mappedPercentageJobStatus}
          percentageFilled={mappedPercentage}
        />
      }
      placement="bottom-start"
    >
      <Tooltip
        content="Learn more about your Estimated Correctness"
        placement="bottom"
      >
        <PercentageChip
          value={+mappedPercentage}
          status={mappedPercentageJobStatus}
          onClick={handleOpen}
        />
      </Tooltip>
    </ContextualizationScoreButton>
  );
};

const ContextualizationScoreButton = styled(Dropdown)`
  margin-left: 3px;
`;
