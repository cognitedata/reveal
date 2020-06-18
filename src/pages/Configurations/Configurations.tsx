import React from 'react';
import { ContentContainer } from './elements';
import DataList from '../../components/Organisms/DataList';

export interface Data {
  headers: string[];
  rows: Array<any[]>;
}

const data: Data = {
  headers: [
    '',
    'Status',
    'Name',
    'Revision',
    'Author',
    'Repository/Project',
    'Actions',
  ],
  rows: [
    [
      '',
      'Active',
      'CWP_Session_1',
      '17/12/2009',
      'Elvis Presley',
      'Valhall_2212/Proj_29886',
      877,
    ],
    [
      'icon_inactive',
      'Inactive',
      'CWP_Session_11',
      '09/10/2011',
      'Ronald Reagan',
      'Phoenix',
      'actions',
    ],
  ],
};

const Configurations = () => {
  return (
    <ContentContainer>
      <DataList data={data} />
    </ContentContainer>
  );
};

export default Configurations;
