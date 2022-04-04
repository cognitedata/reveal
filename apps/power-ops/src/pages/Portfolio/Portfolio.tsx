import { useState, useEffect } from 'react';
import { Button, Tooltip, Label } from '@cognite/cogs.js';
import { useAuthContext } from '@cognite/react-container';
import { BaseContainer } from 'pages/elements';
import { Relationship } from '@cognite/sdk';
import { Column } from 'react-table';
import debounce from 'lodash/debounce';

import { TableData, TableRow } from '../../models/sequences';

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
  StyledTable,
} from './elements';
import GetBidMatrixData from './BidmatrixData';
import { colInput, inputData } from './FakeData';

const Portfolio = () => {
  const { client } = useAuthContext();
  const [sequenceCols, setSequenceCols] = useState<Column<TableData>[]>();
  const [sequenceData, setSequenceData] = useState<TableData[]>();
  const [matrixExternalId, setMatrixExternalId] = useState<string>();

  const currentdate = new Date();
  currentdate.setDate(currentdate.getDate() + 1);
  const tomorrow = currentdate.toLocaleDateString();

  const [selectedButton, setSelectedButton] = useState<string | undefined>(
    undefined
  );

  const [query, setQuery] = useState<string>('');
  const [searchResult, setSearchResult] = useState<Relationship[]>([]);
  const [relationshipList, setRelationshipList] = useState<Relationship[]>();

  const [copied, setCopied] = useState<boolean>(false);
  const [tooltipContent, setTooltipContent] =
    useState<string>('Copy to clipboard');

  const search = async (query: any, callback: any) => {
    const res = await relationshipList?.filter((sequence) =>
      sequence.targetExternalId.toLowerCase().includes(query.toLowerCase())
    );
    callback(res);
  };

  const debouncedSearch = debounce((query, callback) => {
    search(query, callback);
  }, 500);

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
        setSearchResult(response?.items);
      });
  }, []);

  useEffect(() => {
    GetBidMatrixData(client, matrixExternalId).then((response) => {
      setSequenceCols(response?.columns);
      setSequenceData(response?.data);
    });
  }, [matrixExternalId]);

  useEffect(() => {
    if (relationshipList) {
      debouncedSearch(query, (result: Relationship[]) => {
        if (query.length === 0) {
          setSearchResult(relationshipList);
        } else {
          setSearchResult(result);
        }
      });
    }
  }, [query]);

  const copy = async () => {
    // Put sequenceData in proper order
    const copyData = sequenceData?.map((row) => {
      // Remove id
      const newrow: TableRow = { ...row };
      delete newrow.id;

      const orderedRow: TableRow = {};
      sequenceCols?.forEach((col) => {
        const comp = col.accessor?.toString();
        if (comp && col.id && comp in newrow) {
          orderedRow[col.id] = newrow[comp];
        }
      });

      // Insert hour at start of row
      orderedRow[0] = newrow.hour;

      // Return row in copiable format
      return Object.values(orderedRow).join('\t');
    });

    // Create header row in copiable format
    const cols = sequenceCols
      ?.map((column) => {
        return column.Header;
      })
      .join('\t');

    if (copyData && cols) {
      // Add header row
      copyData.unshift(cols);

      // Copy to clipboard
      try {
        await navigator.clipboard
          .writeText(copyData.join('\n'))
          .catch((error) => {
            throw new Error(error);
          });

        // Change tooltip state
        setCopied(true);
        setTooltipContent('Copied!');
      } catch (error) {
        // Change tooltip state
        setCopied(true);
        setTooltipContent('Unable to copy');
      }
    } else {
      throw new Error('No data to copy');
    }
  };

  return (
    <BaseContainer>
      <Header className="top">
        <div>
          <p>Price Area NO 1</p>
          <Label size="small" variant="unknown">
            Last shop run: Today 16:00
          </Label>
        </div>
        <Button icon="Download" type="primary">
          Download
        </Button>
      </Header>
      <Container>
        <LeftPanel>
          <Header className="search">
            <StyledSearch
              icon="Search"
              placeholder="Search plants"
              onChange={(e) => setQuery(e.target.value)}
              value={query}
              clearable={{
                callback: () => {
                  setQuery('');
                },
              }}
            />
          </Header>
          <PanelContent>
            {searchResult &&
              searchResult.map((sequence) => {
                return (
                  <StyledButton
                    toggled={selectedButton === sequence.targetExternalId}
                    onClick={() => {
                      setMatrixExternalId(sequence.targetExternalId);
                      setSelectedButton(sequence.targetExternalId);
                    }}
                    key={sequence.targetExternalId}
                  >
                    <p>{sequence.targetExternalId.split('.')[0]}</p>
                  </StyledButton>
                );
              })}
          </PanelContent>
        </LeftPanel>
        <MainPanel>
          <StyledDiv className="bidmatrix">
            <StyledHeader>
              <div>
                <h1>
                  <p>
                    Bidmatrix: {matrixExternalId?.split('.')[0] || 'Not found'}
                  </p>
                  <Label size="small" variant="unknown">
                    Method 1
                  </Label>
                </h1>
                <h2>{`Generated for: ${tomorrow}`}</h2>
              </div>
              <Tooltip
                position="left"
                visible={copied}
                content={tooltipContent}
              >
                <Button
                  aria-label="Copy Bidmatrix"
                  icon="Copy"
                  onClick={() => {
                    copy();
                  }}
                  onMouseEnter={() => {
                    setCopied(true);
                    setTooltipContent('Copy to clipboard');
                  }}
                  onMouseLeave={() => setCopied(false)}
                />
              </Tooltip>
            </StyledHeader>
            <StyledBidMatrix>
              {sequenceCols && sequenceData && (
                <StyledTable
                  tableHeader={sequenceCols}
                  tableData={sequenceData}
                  className="bidmatrix"
                />
              )}
            </StyledBidMatrix>
          </StyledDiv>
          <StyledDiv className="price-scenario">
            <StyledHeader>
              <div>
                <h1>Price Scenario</h1>
                <h2>
                  Water value
                  <Label size="small" variant="unknown">
                    155 NOK
                  </Label>
                </h2>
              </div>
            </StyledHeader>
            <StyledBidMatrix>
              <StyledTable
                tableHeader={colInput}
                tableData={inputData}
                className="price-scenario"
              />
            </StyledBidMatrix>
          </StyledDiv>
        </MainPanel>
      </Container>
    </BaseContainer>
  );
};

export default Portfolio;
