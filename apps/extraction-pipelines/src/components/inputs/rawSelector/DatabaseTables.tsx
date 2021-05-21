import React, { FunctionComponent, PropsWithChildren } from 'react';
import { Checkbox, Icon, Menu } from '@cognite/cogs.js';
import { RawDBTable } from '@cognite/sdk';
import { createLink } from '@cognite/cdf-utilities';
import styled from 'styled-components';
import { StyledMenu } from 'components/inputs/rawSelector/DatabaseSelector';
import { IntegrationRawTable } from 'model/Integration';
import { StyledTooltip } from 'styles/StyledToolTip';

const ExternalLink = styled.a`
  .visually-hidden {
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    height: 1px;
    overflow: hidden;
    position: static;
    white-space: nowrap;
    width: 1px;
  }
`;

const DBTableItem = styled(Menu.Item)`
  display: flex;
  justify-content: space-between;
`;
export const SELECT_DB_MESSAGE: Readonly<string> =
  'Select database to view tables in';
export const NO_TABLES_IN_DB: Readonly<string> = 'No tables in this database';

interface DatabaseTablesProps {
  selectedDb: string;
  databaseTables: RawDBTable[];
  selectedTables: IntegrationRawTable[];
  onChangeTablesList: (key: string) => void;
}
const Message = styled.p`
  font-style: italic;
  text-align: center;
  padding-top: 10%;
`;
export const DatabaseTables: FunctionComponent<DatabaseTablesProps> = ({
  selectedDb,
  databaseTables,
  selectedTables,
  onChangeTablesList,
}: PropsWithChildren<DatabaseTablesProps>) => {
  if (selectedDb === '') {
    return <Message>{SELECT_DB_MESSAGE}</Message>;
  }
  if (databaseTables.length === 0) {
    return <Message>{NO_TABLES_IN_DB}</Message>;
  }
  return (
    <StyledMenu>
      {databaseTables.map((table) => {
        return (
          <DBTableItem key={`${selectedDb}/${table.name || ''}`}>
            <Checkbox
              name={table.name}
              value={selectedTables.some(
                (record) =>
                  record.dbName === selectedDb &&
                  record.tableName === table.name
              )}
              onChange={() =>
                onChangeTablesList(`${selectedDb}/${table.name || ''}`)
              }
            >
              {table.name}
            </Checkbox>
            <StyledTooltip content="View or ingest data to this RAW table">
              <ExternalLink
                href={createLink(`/raw/${selectedDb}/${table.name || ''}`)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="visually-hidden">{table.name}</span>
                <Icon type="ExternalLink" />
              </ExternalLink>
            </StyledTooltip>
          </DBTableItem>
        );
      })}
    </StyledMenu>
  );
};
