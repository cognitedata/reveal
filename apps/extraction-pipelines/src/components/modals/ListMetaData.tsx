import React, { FunctionComponent } from 'react';
import { upperCamelCase } from '../../utils/primitivesUtils';
import { MetaData } from '../../model/MetaData';

interface OwnProps {
  object: MetaData;
}

type Props = OwnProps;

const ListMetaData: FunctionComponent<Props> = ({ object }: Props) => {
  return (
    <ul>
      {Object.entries(object).map(([k, v]) => {
        return (
          <li key={k}>
            {upperCamelCase(k)}: {v}
          </li>
        );
      })}
    </ul>
  );
};

export default ListMetaData;
