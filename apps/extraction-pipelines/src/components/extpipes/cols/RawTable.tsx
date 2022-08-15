import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';
import LinkWithCopy from 'components/links/LinkWithCopy';
import { NO_RAW_TABLES_MESSAGE } from 'utils/constants';
import { ExtpipeRawTable } from 'model/Extpipe';
import { createLink } from '@cognite/cdf-utilities';

const RawTableWrapper = styled.table`
  width: 50%;
  tbody {
    .grid-heading,
    .grid-row {
      display: grid;
      grid-template-columns: 15rem 15rem;
      grid-column-gap: 1rem;
      grid-row-gap: 0.2rem;
      min-height: 2rem;
      align-items: center;
    }
    .grid-row {
      border-top: 0.0625rem solid ${Colors['greyscale-grey3'].hex()};
    }
    th {
      font-weight: bold;
    }
    .grid-cell {
      display: flex;
      align-items: center;
    }
  }
`;

interface OwnProps {
  rawTables?: ExtpipeRawTable[];
}

type Props = OwnProps;

const RawTable: FunctionComponent<Props> = ({ rawTables }: OwnProps) => {
  if (!rawTables || rawTables.length === 0) {
    return <i>{NO_RAW_TABLES_MESSAGE}</i>;
  }
  return (
    <RawTableWrapper role="grid">
      <tbody>
        <tr className="grid-heading">
          <th scope="col">Database name</th>
          <th scope="col">Table name</th>
        </tr>
        {rawTables?.map(({ dbName, tableName }, index) => {
          const key = `${dbName}-${tableName}-${index}`;
          return (
            <tr className="grid-row" key={key}>
              <td className="grid-cell cell-0">{dbName}</td>
              <td className="grid-cell cell-1">
                <LinkWithCopy
                  href={createLink(`/raw`, {
                    activeTable: `["${dbName}","${tableName}",null]`,
                    tabs: `[["${dbName}","${tableName}",null]]`,
                  })}
                  copyText={tableName}
                  linkText={tableName}
                  copyType="tableName"
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </RawTableWrapper>
  );
};

export default RawTable;
