import React from 'react';
import { ResourceType } from 'modules/types';
import { useGoToStep } from 'hooks';
import ModelInfo from './ModelInfo';

type Props = {
  type: ResourceType | 'diagrams';
  count?: number;
  editable?: boolean;
  text?: string;
};

export default function SelectionInfo(props: Props): JSX.Element {
  const { text, type, count = 0, editable = false } = props;

  const { goToStep } = useGoToStep();

  const getLabel = (): string => {
    let label = '';
    if (type === 'diagrams' || type === 'files') label = 'engineering diagram';
    if (type === 'assets') label = 'asset';
    if (count === 1) return label;
    return `${label}s`;
  };

  const onSelectionClick = () => {
    if (!editable) return;
    if (type === 'diagrams') goToStep('diagramSelection');
    if (type === 'files') goToStep('resourceSelectionFiles');
    if (type === 'assets') goToStep('resourceSelectionAssets');
  };

  return (
    <ModelInfo editable={editable} onClick={onSelectionClick}>
      {text || `${count} ${getLabel()}`}
    </ModelInfo>
  );
}
