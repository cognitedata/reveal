import {
  OptionType,
  Select,
  Table,
  TextInput,
  Tooltip,
  Icon,
} from '@cognite/cogs.js';
import withoutFileExtension from 'components/LineReviewViewer/withoutFileExtension';
import StatusTag from 'components/StatusTag';
import { LineReview, LineReviewStatus } from 'modules/lineReviews/types';
import useLineReviews from 'modules/lineReviews/useLineReviews';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import styled from 'styled-components';

import { LineReviewsWrapper } from './elements';
import Statistic from './Statistic';
import * as Styled from './styled';

type LineReviewTableProps = {
  onRowClick: (lineReview: LineReview) => void;
  lineReviews: LineReview[];
};

const FiltersContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  > * {
    margin-right: 8px;
  }
  padding-bottom: 16px;
`;

const FilterContainer = styled.div`
  width: 300px;
`;

const StyledTableWrapper = styled.div`
  tr {
    cursor: pointer;
  }
`;

const StatusCell = ({ value }: { value: string }) => (
  <StatusTag status={value as LineReviewStatus} />
);

const AssigneeCell = ({ value }: { value: { name: string }[] }) =>
  value.length === 0 ? (
    <span style={{ fontStyle: 'italic', opacity: 0.7 }}>None</span>
  ) : (
    <span style={{ fontWeight: 'bold' }}>
      {value.map((v) => v.name).join(', ')}
    </span>
  );

const shamefulWithoutPrefix = (name: string) =>
  name.substring('PARSED_DIAGRAM_V0.0.7_'.length, name.length);

const shamefulIsIso = (name: string) => !name.includes('MF');

const shamefulIsPid = (name: string) => name.includes('MF');

const IsoCell = ({
  value: documents,
}: {
  value: LineReview['parsedDocumentsExternalIds'];
}) => {
  return (
    <FileCell
      value={documents
        .map((name) => withoutFileExtension(shamefulWithoutPrefix(name)))
        .filter(shamefulIsIso)}
    />
  );
};

const PidCell = ({
  value: documents,
}: {
  value: LineReview['parsedDocumentsExternalIds'];
}) => {
  return (
    <FileCell
      value={documents
        .map((name) => withoutFileExtension(shamefulWithoutPrefix(name)))
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
  value: LineReview['parsedDocumentsExternalIds'];
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
}) => {
  return (
    <StyledTableWrapper>
      <Table
        columns={[
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
            accessor: 'parsedDocumentsExternalIds',
            Cell: IsoCell,
          },
          {
            id: 'pid',
            Header: 'PID',
            accessor: 'parsedDocumentsExternalIds',
            Cell: PidCell,
          },
          {
            Header: 'Assignee',
            accessor: 'assignees',
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

const LineReviews = () => {
  const history = useHistory();

  const { isLoading, lineReviews } = useLineReviews();
  const [search, setSearch] = useState<string>('');
  const statusOptions: OptionType<string>[] = [
    {
      label: 'All',
      value: '',
    },
    {
      label: 'Open',
      value: LineReviewStatus.OPEN,
    },
    {
      label: 'Reviewed',
      value: LineReviewStatus.REVIEWED,
    },
    {
      label: 'Completed',
      value: LineReviewStatus.COMPLETED,
    },
  ];
  const [assigneeOptions, setAssigneeOptions] = useState<OptionType<string>[]>(
    []
  );

  const [status, setStatus] = useState<
    OptionType<LineReviewStatus> | OptionType<string>
  >({
    label: 'All',
    value: '',
  });
  const [assignee, setAssignee] = useState<OptionType<string>>({
    label: 'All',
    value: '',
  });

  useEffect(() => {
    if (!isLoading && lineReviews.length) {
      const assigneeOptions = Object.keys(
        lineReviews.reduce(
          (acc, d) => ({
            ...acc,
            ...d.assignees.reduce(
              (ac, a) => ({
                ...ac,
                [a.name]: true,
              }),
              {}
            ),
          }),
          {}
        )
      );
      setAssigneeOptions([
        { label: 'All', value: '' },
        ...assigneeOptions.map((a) => ({ label: a, value: a })),
      ]);
    }
  }, [lineReviews, isLoading]);

  const filteredLineReviews = lineReviews
    .filter(
      (lineReview) => search.length === 0 || lineReview.name.includes(search)
    )
    .filter(
      (lineReview) =>
        status.value!.length === 0 || status.value === lineReview.status
    )
    .filter(
      (lineReview) =>
        assignee.value!.length === 0 ||
        assignee.value === lineReview.assignees[0].name
    );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <LineReviewsWrapper>
      <Styled.StatisticsContainer>
        <Statistic
          number={lineReviews.length}
          title="Assigned Lines"
          body={`out of ${lineReviews.length} ISOs for Unit 03`}
        />
        <Statistic
          number={
            lineReviews.filter(
              (lineReview) => lineReview.status === LineReviewStatus.REVIEWED
            ).length
          }
          title="Under Review"
          body="Forwarded for onsite or remote check"
        />
        <Statistic
          number={
            lineReviews.filter(
              (lineReview) => lineReview.status === LineReviewStatus.COMPLETED
            ).length
          }
          title="Completed"
          body="Checked and validate onsite"
        />
      </Styled.StatisticsContainer>

      <div style={{ padding: 62 }}>
        <FiltersContainer>
          <FilterContainer>
            <TextInput
              // className="filter-input"
              placeholder="Search"
              icon="Search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              fullWidth
            />
          </FilterContainer>

          <FilterContainer>
            <Select
              title="Status"
              value={status}
              onChange={setStatus}
              options={statusOptions}
            />
          </FilterContainer>

          <FilterContainer>
            <Select
              title="Assignee"
              value={assignee}
              onChange={setAssignee}
              options={assigneeOptions}
            />
          </FilterContainer>
        </FiltersContainer>
        <LineReviewTable
          lineReviews={filteredLineReviews}
          onRowClick={(lineReview) => {
            history.push(`/LineReview/${lineReview.id}`);
          }}
        />
      </div>
    </LineReviewsWrapper>
  );
};

export default LineReviews;
