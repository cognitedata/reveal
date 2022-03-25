import React from 'react';
import Spin from 'antd/lib/spin';
import { isOidcEnv } from 'utils/shared';
import { useCdfGroups } from 'actions';
import { TitleOrnament, MiniInfoTitle } from 'utils/styledComponents';
import Owners from './Owners';
import GroupsWithAccess from './GroupsWithAccess';

interface AccessControlProps {
  dataSetId: number;
  writeProtected: boolean;
}

const AccessControl = ({ dataSetId, writeProtected }: AccessControlProps) => {
  const isOidc = isOidcEnv();

  const { groups = [], isLoading } = useCdfGroups();

  return (
    <Spin spinning={isLoading}>
      {writeProtected && (
        <>
          <MiniInfoTitle style={{ marginTop: '20px' }}>
            Owners of this data set
          </MiniInfoTitle>
          <TitleOrnament />
          <p>
            Only groups that are owners of a write-protected data set can write
            to data inside of the data set.
          </p>
          <Owners dataSetId={dataSetId} groups={groups} isOidcEnv={isOidc} />
        </>
      )}
      <MiniInfoTitle style={{ marginTop: '20px' }}>
        Groups with access scoped to this data set
      </MiniInfoTitle>
      <TitleOrnament />
      <GroupsWithAccess
        dataSetId={dataSetId}
        groups={groups ?? []}
        isOidcEnv={isOidc}
      />
      <p style={{ marginTop: '20px' }}>
        This page does not show groups that may have access to data in this data
        set through other scoping mechanisms.{' '}
        <a
          href="https://docs.cognite.com/cdf/access/guides/create_groups.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn more about scoping mechanisms.
        </a>
      </p>
    </Spin>
  );
};

export default AccessControl;
