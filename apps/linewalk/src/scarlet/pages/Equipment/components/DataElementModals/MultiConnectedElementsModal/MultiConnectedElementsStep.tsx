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
}: MultiConnectedElementsStepProps) => (
  <Styled.Container>
    <Styled.Header>
      {stepInfo && <div className="cogs-detail">{stepInfo}</div>}
      <h5 className="cogs-title-5">{dataElement.config.label}</h5>
    </Styled.Header>

    <ConnectedElements
      dataElement={dataElement}
      detection={detection}
      connectedElements={connectedElements}
      onChange={onChange}
    />
  </Styled.Container>
);
