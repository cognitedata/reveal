import React from 'react';
import { useHistory } from 'react-router-dom';
import { useAppDispatch } from 'store/hooks';
import { setSelectedFile } from 'store/file';
import { Title, Button } from '@cognite/cogs.js';
import { FileInfoSerializable } from 'store/file/types';

import {
  BLabel,
  ItemWrapper,
  TitleContainer,
  TitleRowFlexEnd,
} from '../Calculations/elements';

import { IndicatorContainerImage } from './elements';

interface ComponentProps {
  modelName: string;
  latestFile?: FileInfoSerializable;
  showIndicators: boolean;
}

export default function TitleArea({
  modelName,
  latestFile,
  showIndicators,
  children,
}: React.PropsWithChildren<ComponentProps>) {
  const history = useHistory();
  const dispatch = useAppDispatch();

  const navigateToCalculation = () => {
    dispatch(setSelectedFile(latestFile));
    history.push(`/calculation-library/${modelName}`);
  };

  return (
    <>
      <TitleContainer>
        <Title>{modelName}</Title>
        {!showIndicators && (
          <>
            <ItemWrapper>
              <BLabel>Simulator</BLabel>
              <IndicatorContainerImage>
                <img
                  src={`${
                    process.env.PUBLIC_URL
                  }/simulators/${latestFile?.source?.toLowerCase()}.png`}
                  alt={latestFile?.source}
                  style={{ marginRight: 12 }}
                />
                <p>{latestFile?.source}</p>
              </IndicatorContainerImage>
            </ItemWrapper>
            <ItemWrapper>
              <BLabel>Version</BLabel>
              {latestFile?.metadata?.version}
            </ItemWrapper>
            <ItemWrapper>
              <BLabel>Calculations</BLabel>
              <Button icon="FlowChart" onClick={navigateToCalculation} />
            </ItemWrapper>
          </>
        )}
      </TitleContainer>
      <TitleRowFlexEnd>{children}</TitleRowFlexEnd>
    </>
  );
}
