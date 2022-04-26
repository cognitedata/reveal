import { useDataElementConfig } from 'scarlet/hooks';
import { DataElement, Detection } from 'scarlet/types';

import { ConnectedElements } from '../..';

import * as Styled from './style';

interface MultiConnectedElementsStepProps {
  stepInfo?: string;
  dataElement: DataElement;
  connectedElements: DataElement[];
  detection: Detection;
  onChange: (ids: string[]) => void;
}

export const MultiConnectedElementsStep = ({
  stepInfo,
  dataElement,
  connectedElements,
  detection,
  onChange,
}: MultiConnectedElementsStepProps) => {
  const dataElementConfig = useDataElementConfig(dataElement);

  return (
    <Styled.Container>
      <Styled.Header>
        {stepInfo && <div className="cogs-detail">{stepInfo}</div>}
        <h5 className="cogs-title-5">{dataElementConfig?.label}</h5>
      </Styled.Header>

      <ConnectedElements
        dataElement={dataElement}
        detection={detection}
        connectedElements={connectedElements}
        onChange={onChange}
      />
    </Styled.Container>
  );
};
