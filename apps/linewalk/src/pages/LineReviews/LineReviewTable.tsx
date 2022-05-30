import { Table, Tooltip, Icon } from '@cognite/cogs.js';
import withoutFileExtension from 'components/LineReviewViewer/withoutFileExtension';
import StatusTag from 'components/StatusTag';
import { LineReview, LineReviewStatus } from 'modules/lineReviews/types';
import React from 'react';
import styled from 'styled-components';

type LineReviewTableProps = {
  onRowClick: (lineReview: LineReview) => void;
  lineReviews: LineReview[];
  unit: string | undefined;
};

const StyledTableWrapper = styled.div`
  tr {
    cursor: pointer;
  }
`;

const StatusCell = ({ value }: { value: string }) => (
  <StatusTag status={value as LineReviewStatus} />
);

const AssigneeCell = ({ value }: { value: { name: string }[] }) =>
  value ? (
    <span style={{ fontWeight: 'bold' }}>{value}</span>
  ) : (
    <span style={{ fontStyle: 'italic', opacity: 0.7 }}>None</span>
  );

const shamefulIsIso = (name: string) => !name.includes('MF');

const shamefulIsPid = (name: string) => name.includes('MF');

const IsoCell = ({
  value: documents,
}: {
  value: LineReview['pdfExternalIds'];
}) => {
  return (
    <FileCell
      value={documents
        .map((name) => withoutFileExtension(name))
        .filter(shamefulIsIso)}
    />
  );
};

const PidCell = ({
  value: documents,
}: {
  value: LineReview['pdfExternalIds'];
}) => {
  return (
    <FileCell
      value={documents
        .map((name) => withoutFileExtension(name))
        .filter(shamefulIsPid)}
    />
  );
};

type BadgeProps = {
  label: string;
};

const StyledBadgeContainer = styled.span`
  color: #4a67fb;
  border: 1px solid #4a67fb;
  box-sizing: border-box;
  border-radius: 4px;
  font-family: Inter;
  font-style: normal;
  font-weight: 600;
  font-size: 10px;
  line-height: 16px;
  /* identical to box height, or 160% */

  letter-spacing: 0.4px;
  text-transform: uppercase;
  font-feature-settings: 'cpsp' on, 'ss04' on;
`;

const Badge: React.FC<BadgeProps> = ({ label }) => (
  <StyledBadgeContainer>{label}</StyledBadgeContainer>
);

const FileCell = ({
  value: documentExternalIds,
}: {
  value: LineReview['pdfExternalIds'];
}) => {
  if (documentExternalIds.length === 0) {
    return <div>N/A</div>;
  }

  return (
    <>
      {documentExternalIds.slice(0, 2).map((externalId, index, slicedArray) => (
        <React.Fragment key={externalId}>
          <span>
            {externalId}
            &nbsp;
          </span>
          {index < slicedArray.length - 1 && <br />}
        </React.Fragment>
      ))}
      {documentExternalIds.length > 1 && (
        <Tooltip
          content={documentExternalIds.map((documentExternalId) => (
            <div key={documentExternalId}>{documentExternalId}</div>
          ))}
        >
          <Badge label={`+${documentExternalIds.length}`} />
        </Tooltip>
      )}
    </>
  );
};

type CommentCellProps = {
  value: string;
};

const CommentCell: React.FC<CommentCellProps> = ({ value }) => {
  if (value === undefined || value === '') {
    return <div />;
  }

  return (
    <Tooltip content={value}>
      <Icon type="Comment" style={{ color: '#4A67FB' }} />
    </Tooltip>
  );
};

const LineReviewTable: React.FC<LineReviewTableProps> = ({
  lineReviews,
  onRowClick,
  unit,
}) => {
  return (
    <StyledTableWrapper>
      <Table
        locale={{
          emptyText: !unit ? 'You have to select the unit first.' : '',
        }}
        columns={[
          {
            Header: 'Unit',
            accessor: 'unit',
          },
          {
            Header: 'Name',
            accessor: 'name',
          },
          {
            Header: 'Status',
            accessor: 'status',
            Cell: StatusCell,
          },
          {
            id: 'iso',
            Header: 'ISO',
            accessor: 'pdfExternalIds',
            Cell: IsoCell,
          },
          {
            id: 'pid',
            Header: 'PID',
            accessor: 'pdfExternalIds',
            Cell: PidCell,
          },
          {
            Header: 'Assignee',
            accessor: 'assignee',
            Cell: AssigneeCell,
          },
          {
            Header: 'Comment',
            accessor: 'comment',
            Cell: CommentCell,
          },
        ]}
        dataSource={lineReviews}
        onRowClick={(row) => onRowClick(row.original)}
      />
    </StyledTableWrapper>
  );
};

export default LineReviewTable;
