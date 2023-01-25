import { Input } from '@cognite/cogs.js';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Page } from '../elements';

export const ContentionsPage = () => {
  const { id } = useParams();

  const [value, setValue] = useState('');
  console.log(
    '🚀 ~ file: ConventionsPage.tsx:5 ~ ContentionsPage ~ params',
    id
  );

  return (
    <Page>
      <Content>
        <StructureInput
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </Content>
    </Page>
  );
};

const StructureInput = styled(Input)`
  && {
    width: 500px;
    font-size: 32px;
  }
`;

const Content = styled.section`
  padding: 24px 156px;
  && {
    display: flex;
    justify-content: center;
  }
`;
