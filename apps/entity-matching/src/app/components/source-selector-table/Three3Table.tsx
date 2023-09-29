import styled from 'styled-components';

import { Icon } from '@cognite/cogs.js';

import { use3DModels } from '../../hooks/threeD';
import ThreeDRevisions from '../three-d-revisions';

export default function ThreeDMOdelGrid() {
  const { data = [], isInitialLoading, error } = use3DModels();

  if (error) {
    return <Icon type="Error" />;
  }
  if (isInitialLoading) {
    return <Icon type="Loader" />;
  }
  return (
    <ModelGrid>
      {data.map((model) => (
        <ThreeDRevisions key={model.id} model={model} />
      ))}
    </ModelGrid>
  );
}

const ModelGrid = styled.div`
  margin-top: 12px;
  display: grid;
  gap: 12px;
  grid-template-columns: 400px 400px 400px;
`;
