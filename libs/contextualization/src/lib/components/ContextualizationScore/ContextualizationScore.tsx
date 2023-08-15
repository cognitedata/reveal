import { useState } from 'react';
import { useParams } from 'react-router-dom';

import styled from 'styled-components';

import { Tooltip, Dropdown } from '@cognite/cogs.js';

import { useSelectedDataModelVersion } from '../../hooks/data-model-version/useSelectedDataModelVersion';
import { useMeasureMappedPercentages } from '../../hooks/useMeasureMappedPercentages';
import { extractPropertiesFromURL } from '../../utils/extractPropertiesFromURL';

import { ContextualizationScoreInfoPanel } from './ContextualizationScoreInfoPanel';
import { PercentageChip } from './tabs/PercentageChip';

export const ContextualizationScore = ({
  headerName,
  dataModelType,
}: {
  headerName: string;
  dataModelType: string;
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { type } = extractPropertiesFromURL();
  const { dataModelExternalId = '', space = '', version = '' } = useParams();
  const {
    dataModelVersion: { version: versionNumber },
  } = useSelectedDataModelVersion(version, dataModelExternalId, space);

  const { mappedPercentageJobStatus, mappedPercentage } =
    useMeasureMappedPercentages(type, space, versionNumber, headerName);

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
