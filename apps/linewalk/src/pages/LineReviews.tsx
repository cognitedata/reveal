import React, { useCallback, useEffect, useState } from 'react';
import { OptionType, Select, Table, TextInput } from '@cognite/cogs.js';
import useLineReviews from 'modules/lineReviews/hooks';
import { LineReview, LineReviewStatus } from 'modules/lineReviews/types';
import { useHistory } from 'react-router';
import StatusTag from 'components/StatusTag';
import styled from 'styled-components';

import * as Styled from './styled';
import { LineReviewsWrapper } from './elements';
import Statistic from './Statistic';

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
  width: 220px;
`;

const StatusCell = ({ value }: { value: string }) => (
  <StatusTag status={value as LineReviewStatus} />
);

const IsoCell = ({ value: documents }: { value: LineReview['documents'] }) => {
  return <FileCell value={documents.filter(({ type }) => type === 'ISO')} />;
};

const PidCell = ({ value: documents }: { value: LineReview['documents'] }) => {
  return <FileCell value={documents.filter(({ type }) => type === 'PID')} />;
};

type BadgeProps = {
  label: string;
  onClick: (event: React.MouseEvent) => void;
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

const Badge: React.FC<BadgeProps> = ({ label, onClick }) => (
  <StyledBadgeContainer onClick={onClick}>{label}</StyledBadgeContainer>
);

const FileCell = ({ value: documents }: { value: LineReview['documents'] }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (documents.length === 0) {
    return <div>N/A</div>;
  }

  return (
    <>
      {documents
        .slice(0, isExpanded ? undefined : 1)
        .map((document, index, slicedArray) => (
          <React.Fragment key={document.id}>
            <span>
              {document.fileExternalId}
              &nbsp;
            </span>
            {index < slicedArray.length - 1 && <br />}
          </React.Fragment>
        ))}
      {documents.length > 1 && (
        <Badge
          label={isExpanded ? '<<' : `+${documents.length}`}
          onClick={(event) => {
            event.stopPropagation();
            setIsExpanded((v) => !v);
          }}
        />
      )}
    </>
  );
};

const AssigneeCell = ({ value }: { value: { name: string }[] }) =>
  value.length === 0 ? (
    <span style={{ fontStyle: 'italic', opacity: 0.7 }}>None</span>
  ) : (
    <span style={{ fontWeight: 'bold' }}>
      {value.map((v) => v.name).join(', ')}
    </span>
  );

const LineReviewTable: React.FC<LineReviewTableProps> = ({
  lineReviews,
  onRowClick,
}) => {
  return (
    <Table
      columns={[
        {
          Header: 'System',
          accessor: 'system',
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
          accessor: 'documents',
          Cell: IsoCell,
        },
        {
          id: 'pid',
          Header: 'PID',
          accessor: 'documents',
          Cell: PidCell,
        },
        {
          Header: 'Assignee',
          accessor: 'assignees',
          Cell: AssigneeCell,
        },
      ]}
      dataSource={lineReviews}
      onRowClick={(row) => onRowClick(row.original)}
    />
  );
};

const LineReviews = () => {
  const history = useHistory();
  const { lineReviews, populateLineReviews } = useLineReviews();

  const [search, setSearch] = useState<string>('');
  const [statusOptions, setStatusOptions] = useState<
    OptionType<LineReviewStatus>[]
  >([]);
  const [status, setStatus] = useState<OptionType<LineReviewStatus>[]>([]);

  const [assigneeOptions, setAssigneeOptions] = useState<OptionType<string>[]>(
    []
  );
  const [assignee, setAssignee] = useState<OptionType<string>[]>([]);

  useEffect(() => {
    populateLineReviews();
  }, []);

  useEffect(() => {
    if (lineReviews.length) {
      const statusOptions = Object.keys(
        lineReviews.reduce(
          (acc, d) => ({
            ...acc,
            [d.status]: true,
          }),
          {}
        )
      ) as LineReviewStatus[];
      setStatusOptions(
        statusOptions.map((opt) => ({
          label: opt,
          value: opt,
        }))
      );

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
      setAssigneeOptions(assigneeOptions.map((a) => ({ label: a, value: a })));
    }
  }, [lineReviews]);

  const filterLineReviews = useCallback(
    (LineReview: LineReview) => {
      if (assignee.length <= 0 && status.length <= 0 && search.length <= 0) {
        return true;
      }
      if (
        LineReview.assignees.some((a) =>
          assignee.some((b) => b.value === a.name)
        )
      ) {
        return true;
      }

      if (status.some((s) => s.value === LineReview.status)) {
        return true;
      }

      // if (
      //   search.length > 0 &&
      //   (LineReview.name.includes(search) ||
      //     LineReview.description.includes(search))
      // ) {
      //   return true;
      // }
      return false;
    },
    [assignee, status, search]
  );

  return (
    <LineReviewsWrapper>
      <Styled.StatisticsContainer>
        <Statistic
          number={lineReviews.length}
          title="Assigned Lines"
          body="out of 273 ISOs for Unit 40"
        />
        <Statistic
          number={lineReviews.length}
          title="Under Review"
          body="Forwarded for onsite or remote check"
        />
        <Statistic
          number={lineReviews.length}
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
              className="filter-input"
              isMulti
              title="Status"
              value={status}
              onChange={setStatus}
              options={statusOptions}
              fullWidth
            />
          </FilterContainer>

          <FilterContainer>
            <Select
              className="filter-input"
              isMulti
              title="Assignee"
              value={assignee}
              onChange={setAssignee}
              options={assigneeOptions}
              fullWidth
            />
          </FilterContainer>
        </FiltersContainer>
        <LineReviewTable
          lineReviews={lineReviews.filter(filterLineReviews)}
          onRowClick={(lineReview) => {
            history.push(`/LineReview/${lineReview.id}`);
          }}
        />
      </div>
    </LineReviewsWrapper>
  );
};

export default LineReviews;
