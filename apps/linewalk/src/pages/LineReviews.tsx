import { useCallback, useEffect, useState } from 'react';
import { Input, OptionType, Select, Table } from '@cognite/cogs.js';
import useLineReviews from 'modules/lineReviews/hooks';
import { LineReview, LineReviewStatus } from 'modules/lineReviews/types';
import { useHistory } from 'react-router';
import StatusTag from 'components/StatusTag';

import { LineReviewsWrapper, Stats } from './elements';

type LineReviewTableProps = {
  onRowClick: (lineReview: LineReview) => void;
  lineReviews: LineReview[];
};

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

const LineReviewTable: React.FC<LineReviewTableProps> = ({
  lineReviews,
  onRowClick,
}) => {
  return (
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
          Header: 'LineReview',
          accessor: 'description',
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

  const filterlineReviews = useCallback(
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

      if (
        search.length > 0 &&
        (LineReview.name.includes(search) ||
          LineReview.description.includes(search))
      ) {
        return true;
      }
      return false;
    },
    [assignee, status, search]
  );

  return (
    <LineReviewsWrapper>
      <Stats>
        <div className="stat">
          <div className="number">{lineReviews.length}</div>
          <div className="text">LineReviews identified</div>
        </div>
        <div className="stat">
          <div className="number">
            {lineReviews.filter((d) => d.status === 'REVIEW').length}
          </div>
          <div className="text">Under Review</div>
        </div>
        <div className="stat">
          <div className="number">
            {lineReviews.filter((d) => d.status === 'RESOLVED').length}
          </div>
          <div className="text">Completed</div>
        </div>
      </Stats>
      <div style={{ padding: 62 }}>
        <div className="filters">
          <Input
            className="filter-input"
            placeholder="Search"
            icon="Search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
          />
          <Select
            className="filter-input"
            isMulti
            title="Status"
            value={status}
            onChange={setStatus}
            options={statusOptions}
          />
          <Select
            className="filter-input"
            isMulti
            title="Assignee"
            value={assignee}
            onChange={setAssignee}
            options={assigneeOptions}
          />
        </div>
        <div>
          <LineReviewTable
            lineReviews={lineReviews.filter(filterlineReviews)}
            onRowClick={(lineReview) => {
              history.push(`/LineReview/${lineReview.id}`);
            }}
          />
        </div>
      </div>
    </LineReviewsWrapper>
  );
};

export default LineReviews;
