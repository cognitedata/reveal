import React, { useMemo, useState } from 'react';

import { getAssigneeName } from 'dataLayers/userManagementService/adapters/getAssigneeName';
import { useUserInfo } from 'services/userManagementService/query';

import { Dropdown, Menu, Label } from '@cognite/cogs.js';
import { UMSUser } from '@cognite/user-management-service-types';

import { NoPropagationWrapper } from 'components/buttons/NoPropagationWrapper';
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
  const { data: user } = useUserInfo();
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
    return getAssigneeName(visibleAssignee, user?.id);
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
            <DangerButton onClick={unassignModal}>{UNASSIGN}</DangerButton>
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
