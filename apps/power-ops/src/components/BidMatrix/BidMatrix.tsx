import { Detail } from '@cognite/cogs.js';
import dayjs from 'dayjs';
import { TableData } from 'types';
import { HeadlessTable } from 'components/HeadlessTable';

import { CopyButton } from '../CopyButton/CopyButton';

import {
  StyledTitle,
  StyledDiv,
  StyledHeader,
  StyledBidMatrixTable,
  StyledPriceScenarioTable,
} from './elements';
import { BidMatrixTableData } from './utils';

type Props = {
  bidDate?: dayjs.Dayjs;
  bidMatrixTitle: string;
  bidMatrixExternalId: string;
  bidMatrixTableData: BidMatrixTableData;
  mainScenarioTableData: TableData[];
  onBidMatrixCopyClick: () => Promise<boolean>;
};

export const BidMatrix = ({
  bidDate,
  bidMatrixTitle,
  bidMatrixExternalId,
  bidMatrixTableData,
  mainScenarioTableData,
  onBidMatrixCopyClick,
}: Props) => (
  <div className="main">
    <StyledDiv className="bidmatrix">
      <StyledHeader>
        <div>
          <span>
            <StyledTitle level={5}>Bid matrix: {bidMatrixTitle}</StyledTitle>
          </span>
          <Detail>
            Generated for {bidDate?.format('MMM DD, YYYY')} -{' '}
            {bidMatrixExternalId}
          </Detail>
        </div>
        <CopyButton copyFunction={onBidMatrixCopyClick} />
      </StyledHeader>
      <StyledBidMatrixTable>
        <HeadlessTable
          tableHeader={bidMatrixTableData.columns}
          tableData={bidMatrixTableData.data}
          className="bidmatrix"
        />
      </StyledBidMatrixTable>
    </StyledDiv>
    <StyledDiv className="price-scenario">
      <StyledHeader>
        <div>
          <span>
            <StyledTitle level={5}>Price Scenario</StyledTitle>
          </span>
          <Detail>
            {/* TODO(POWEROPS-297): Replace with water value */}
            <div style={{ height: '16px' }} />
            {/* <Label size="small" variant="unknown">
                Water value
                  155 NOK
                </Label> */}
          </Detail>
        </div>
      </StyledHeader>
      <StyledPriceScenarioTable>
        <HeadlessTable
          tableHeader={[
            { Header: 'Base Price', accessor: 'base' },
            { Header: 'Production', accessor: 'production' },
          ]}
          tableData={mainScenarioTableData}
          className="price-scenario"
        />
      </StyledPriceScenarioTable>
    </StyledDiv>
  </div>
);
