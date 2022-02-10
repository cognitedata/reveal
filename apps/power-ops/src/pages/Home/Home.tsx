import { useState } from 'react';
import { Button, Graphic, Loader, Table, Body } from '@cognite/cogs.js';
import { useAuthContext } from '@cognite/react-container';
import { Asset } from '@cognite/sdk';

import { Container } from '../elements';

import { Header, StyledTable } from './elements';
import { data, colResults, inputData, colInput } from './FakeData';

const Home = () => {
  const { client } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [assets, setAssets] = useState<Asset[]>();

  const clickHandler = async () => {
    setIsLoading(true);
    const response = await client?.assets.list();
    setAssets(response?.items);
    setIsLoading(false);
  };

  const buttonText = 'Call SHOP';

  if (isLoading) {
    return (
      <Container>
        <Loader infoTitle="Fetching data from SHOP" darkMode={false} />
      </Container>
    );
  }

  return (
    <>
      {!assets ? (
        <Container>
          <Header data-test-id="header">
            <Graphic type="Cognite" />
            <p>Welcome to the Cognite Power Ops.</p>
          </Header>
          <Body>Please review input data below.</Body>
          <StyledTable>
            <Table columns={colInput as any} dataSource={inputData} />
          </StyledTable>
          <Button type="danger" onClick={clickHandler}>
            {buttonText}
          </Button>
        </Container>
      ) : (
        <Container>
          <Table columns={colResults as any} dataSource={data} />
        </Container>
      )}
    </>
  );
};

export default Home;
