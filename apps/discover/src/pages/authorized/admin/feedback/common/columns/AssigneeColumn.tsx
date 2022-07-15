import { useUserInfoQuery } from 'domain/userManagementService/internal/queries/useUserInfoQuery';
import { getAssigneeName } from 'domain/userManagementService/internal/selectors/getAssigneeName';

import React, { useMemo, useState } from 'react';

import { Dropdown, Menu, Label } from '@cognite/cogs.js';
import { UMSUser } from '@cognite/user-management-service-types';

import { NoPropagationWrapper } from 'components/Buttons/NoPropagationWrapper';
import { DangerButton } from 'pages/authorized/favorites/elements';

import { ASSIGNED_TO, UNASSIGN, UNASSIGNED } from '../../constants';
import { AssignToDropdown } from '../elements';
import { UnassignWarningModal } from '../UnassignWarningModal';

import { AdminList } from './AdminList';

interface Props {
  assignFeedback: (userId: string) => void;
  unassignFeedback: () => void;
  adminUsers?: UMSUser[];
  assignee?: UMSUser;
}

export const AssigneeColumn: React.FC<Props> = (props) => {
  const { assignee, assignFeedback, unassignFeedback, adminUsers } = props;
  const { data: user } = useUserInfoQuery();
  const [visibleAssignee, setVisibleAssignee] = React.useState<
    UMSUser | undefined
  >(assignee);
  const [openModal, setOpenModal] = useState(false);

  const unassign = () => {
    unassignModal();
    setVisibleAssignee(undefined);
    unassignFeedback();
  };

  const unassignModal = () => {
    setOpenModal((prevState) => !prevState);
  };

  const assign = (user: UMSUser) => {
    setVisibleAssignee(user);
    assignFeedback(user.id);
  };

  const assigneeName = useMemo(() => {
    return getAssigneeName(visibleAssignee, user?.id) || UNASSIGNED;
  }, [visibleAssignee?.displayName, user?.id]);

  const MenuContent = (
    <AssignToDropdown>
      <>
        <Menu.Submenu
          content={
            <AdminList
              adminList={adminUsers}
              currentUserId={user?.id}
              assigneeId={assignee?.id}
              assign={assign}
            />
          }
        >
          <span>{ASSIGNED_TO}</span>
        </Menu.Submenu>
        {assignee && (
          <>
            <Menu.Divider />
            <DangerButton
              data-testid="unassign-feedback"
              onClick={unassignModal}
            >
              {UNASSIGN}
            </DangerButton>
          </>
        )}
      </>
    </AssignToDropdown>
  );

  return (
    <NoPropagationWrapper>
      <Dropdown content={MenuContent}>
        <Label
          size="medium"
          iconPlacement="right"
          icon="ChevronDownLarge"
          variant={visibleAssignee ? 'normal' : 'unknown'}
          aria-label={UNASSIGNED}
        >
          {assigneeName}
        </Label>
      </Dropdown>
      <UnassignWarningModal
        openModal={openModal}
        unassignModal={unassignModal}
        unassign={unassign}
      />
    </NoPropagationWrapper>
  );
};
