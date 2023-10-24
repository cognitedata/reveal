import styled from 'styled-components';

import { Body, Chip } from '@cognite/cogs.js';

import { StyledInfobox } from '@data-exploration-components';

import { ImproveYourScore } from './ImproveYourScore';

export const AdvancedJoinsDocumentationTab = ({
  headerName,
  dataModelType,
}: {
  headerName: string;
  dataModelType: string;
}) => {
  return (
    <Container data-testid="Operators-tab">
      <StyledInfobox>
        <div style={{ maxHeight: '500px', overflow: 'auto' }}>
          <Body level={3}>
            This score signifies the projected accuracy of the direct
            relationships within the given Data modeling property (column).
          </Body>
          <br />
          <h3>
            Understanding <em>Advanced Join</em>
          </h3>
          <ol>
            <li>Gather matches from a Subject Matter Expert.</li>
            <li>Use algorithms to match the same problem</li>
            <li>Run the advanced join</li>
            <li>Be confident that your data model is in a good state</li>
          </ol>
        </div>
      </StyledInfobox>

      <span>
        <Chip size="small" label="Estimated Correctness" type="neutral" />{' '}
        consists of
      </span>
      <span>
        <Chip size="small" label="Percentage filled" type="default" /> Number of
        cells joined, divided by total amount of cells
      </span>
      <span>
        <Chip size="small" label="Contextualization score" type="default" /> The
        estimated quality based on the latest applied matcher and the manual
        matches.
      </span>
      <ImproveYourScore headerName={headerName} dataModelType={dataModelType} />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
