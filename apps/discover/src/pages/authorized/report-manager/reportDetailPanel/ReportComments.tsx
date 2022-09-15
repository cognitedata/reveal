import { DISCOVER_WELL_REPORT } from 'domain/reportManager/internal/constants';

import styled from 'styled-components/macro';

import { ListComments } from '@cognite/react-comments';

import { SIDECAR } from 'constants/app';

import { ReportDetailProps } from '../types';

const CommentsContainer = styled.div`
  padding-top: 16px;
  padding-bottom: 16px;
`;

export const ReportComments = ({ report }: ReportDetailProps) => {
  return (
    <CommentsContainer>
      <ListComments
        commentServiceBaseUrl={SIDECAR.commentServiceBaseUrl}
        userManagementServiceBaseUrl={SIDECAR.userManagementServiceBaseUrl}
        fasAppId={SIDECAR.aadApplicationId}
        target={{
          id: `${DISCOVER_WELL_REPORT}-${report.id}`,
          targetType: DISCOVER_WELL_REPORT,
        }}
      />
    </CommentsContainer>
  );
};
