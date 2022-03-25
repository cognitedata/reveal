import { FunctionComponent, PropsWithChildren } from 'react';
import Tag from 'antd/lib/tag';
import { NoDataText, NoStyleList } from 'utils/styledComponents';

export const SOURCE_TEXT: Readonly<string> =
  'The data set comes from a data source which can be a source system, a file, or an application.';

export interface SourceProps {
  sourceNames?: string[];
}

export const Source: FunctionComponent<SourceProps> = ({
  sourceNames,
}: PropsWithChildren<SourceProps>) => {
  return (
    <NoStyleList>
      {sourceNames ? (
        sourceNames.map((sourceName) => (
          <li key={sourceName}>
            <Tag>{sourceName}</Tag>
          </li>
        ))
      ) : (
        <NoDataText>No source set</NoDataText>
      )}
    </NoStyleList>
  );
};
