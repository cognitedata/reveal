import { Detail } from '@cognite/cogs.js-v9';
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
  bidDate: dayjs.Dayjs;
  bidMatrixTitle: string;
  bidMatrixExternalId: string;
  bidMatrixTableData: BidMatrixTableData;
  mainScenarioTableData: TableData[];
  onBidMatrixCopyClick: () => Promise<boolean>;
};

const priceScenarioTableColumns = [
  { Header: 'Base Price', accessor: 'base' },
  { Header: 'Production', accessor: 'production' },
];

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
            Generated for {bidDate.format('MMM DD, YYYY')} -{' '}
            {bidMatrixExternalId}
          </Detail>
        </div>
        <CopyButton onClick={onBidMatrixCopyClick} />
      </StyledHeader>
      <StyledBidMatrixTable>
        <HeadlessTable
          columns={bidMatrixTableData.columns}
          data={bidMatrixTableData.data}
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
            {/* <Chip size="small" label="Water value 155 NOK" /> */}
          </Detail>
        </div>
      </StyledHeader>
      <StyledPriceScenarioTable>
        <HeadlessTable
          columns={priceScenarioTableColumns}
          data={mainScenarioTableData}
          className="price-scenario"
        />
      </StyledPriceScenarioTable>
    </StyledDiv>
  </div>
);
