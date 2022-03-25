import { useState, useEffect } from 'react';
import { Button } from '@cognite/cogs.js';
import { useAuthContext } from '@cognite/react-container';
import { BaseContainer } from 'pages/elements';
import { Relationship } from '@cognite/sdk';
import { Column } from 'react-table';

import { TableData } from '../../models/sequences';

import {
  Container,
  Header,
  StyledDiv,
  StyledHeader,
  StyledBidMatrix,
  PanelContent,
  LeftPanel,
  MainPanel,
  StyledSearch,
  StyledButton,
} from './elements';
import GetBidMatrixData from './BidmatrixData';
import BidmatrixTable from './GetBidmatrixTable';

const Portfolio = () => {
  const { client } = useAuthContext();
  const [sequenceCols, setSequenceCols] = useState<Column<TableData>[]>();
  const [sequenceData, setSequenceData] = useState<TableData[]>();
  const [relationshipList, setRelationshipList] = useState<Relationship[]>();
  const [matrixExternalId, setMatrixExternalId] = useState<string>();
  const currentdate = new Date();
  currentdate.setDate(currentdate.getDate() + 1);
  const tomorrow = currentdate.toLocaleDateString();

  useEffect(() => {
    client?.relationships
      .list({
        filter: {
          sourceTypes: ['event'],
          targetTypes: ['sequence'],
          labels: {
            containsAny: [
              {
                externalId: 'relationship_to.bid_matrix_sequence',
              },
            ],
          },
        },
      })
      .then((response) => {
        setRelationshipList(response?.items);
      });
  }, []);

  useEffect(() => {
    GetBidMatrixData(client, matrixExternalId).then((response) => {
      setSequenceCols(response?.columns);
      setSequenceData(response?.data);
    });
  }, [matrixExternalId]);

  return (
    <BaseContainer>
      <Header className="top">
        <p>Price Area NO 1</p>
        <Button icon="Download" type="primary">
          Download
        </Button>
      </Header>
      <Container>
        <LeftPanel>
          <Header>
            <StyledSearch icon="Search" placeholder="Search" />
          </Header>
          <PanelContent>
            {relationshipList &&
              relationshipList.map((sequence) => {
                return (
                  <StyledButton
                    onClick={() =>
                      setMatrixExternalId(sequence.targetExternalId)
                    }
                    key={sequence.externalId}
                  >
                    <p>{sequence.externalId}</p>
                  </StyledButton>
                );
              })}
          </PanelContent>
        </LeftPanel>
        <MainPanel>
          <StyledDiv>
            <StyledHeader>
              <h1>{matrixExternalId || 'Bidmatrix not found'}</h1>
              <h2>{`Generated for: ${tomorrow}`}</h2>
            </StyledHeader>
            <StyledBidMatrix>
              {sequenceCols && sequenceData && (
                <BidmatrixTable
                  tableHeader={sequenceCols}
                  tableData={sequenceData}
                />
              )}
            </StyledBidMatrix>
          </StyledDiv>
        </MainPanel>
      </Container>
    </BaseContainer>
  );
};

export default Portfolio;
