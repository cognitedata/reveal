import styled from 'styled-components';

import { Canvas } from 'components/canvas';
import { useParams } from 'react-router-dom';
import { useFlow, useInsertFlow } from 'hooks/raw';
import { Icon } from '@cognite/cogs.js';
import debounce from 'lodash/debounce';

const Flow = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useFlow(id!, { enabled: !!id });
  const { mutate } = useInsertFlow();
  const onChange = debounce(mutate, 100);

  if (isLoading) {
    return <Icon type="Loader" />;
  }
  if (error) {
    return <pre>{JSON.stringify(error, null, 2)}</pre>;
  }
  if (!id || !data) {
    return <>404</>;
  }

  return (
    <FlowContainer>
      <Canvas flow={data} onChange={onChange} />
    </FlowContainer>
  );
};

const FlowContainer = styled.div`
  height: 100%;
  width: 100%;
`;

export default Flow;
