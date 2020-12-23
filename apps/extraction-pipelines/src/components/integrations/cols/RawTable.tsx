import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';
import LinkWithCopy from 'components/links/LinkWithCopy';
import { Raw } from '../../../model/Integration';
import { useAppEnv } from '../../../hooks/useAppEnv';

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

export const NO_RAW_TABLES_MESSAGE: Readonly<string> = 'No raw tables set';
interface OwnProps {
  // eslint-disable-next-line
  rawTables?: Raw[];
}

type Props = OwnProps;

const RawTable: FunctionComponent<Props> = ({ rawTables }: OwnProps) => {
  const { cdfEnv, project, origin } = useAppEnv();
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
          return (
            <tr className="grid-row" key={`${dbName}-${tableName}-${index}`}>
              <td className="grid-cell cell-0">
                <LinkWithCopy
                  href={`${origin}/${project}/raw/${dbName}/${
                    cdfEnv ? `?env=${cdfEnv}` : ''
                  }`}
                  linkText={dbName}
                  copyText={dbName}
                />
              </td>
              <td className="grid-cell cell-1">
                <LinkWithCopy
                  href={`${origin}/${project}/raw/${dbName}/${tableName}${
                    cdfEnv ? `?env=${cdfEnv}` : ''
                  }`}
                  copyText={tableName}
                  linkText={tableName}
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
