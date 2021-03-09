import { useRouteMatch } from 'react-router-dom';
import { createLink } from '@cognite/cdf-utilities';
import { Icon, Title } from '@cognite/cogs.js';
import React from 'react';
import { RegisterIntegrationInfo } from '../../model/Integration';
import { withTenant } from '../../routing/CreateRouteConfig';
import { useStoredRegisterIntegration } from '../../hooks/useStoredRegisterIntegration';
import { getFieldValue } from '../../utils/fieldUtils';
import { StyledNavLink } from '../../styles/StyledButtons';

export interface TaskItemProps {
  path: string;
  title: string;
  description: string;
  pointNumber: number;
  fieldName: keyof Partial<RegisterIntegrationInfo>;
}
export const TaskItem = ({
  path,
  description,
  title,
  pointNumber,
  fieldName,
}: TaskItemProps) => {
  const match = useRouteMatch(withTenant(path));
  const { storedIntegration } = useStoredRegisterIntegration();
  const isCurrent = match?.isExact;
  const existingInput = getFieldValue(fieldName, storedIntegration);
  return (
    <li>
      <StyledNavLink
        to={createLink(path)}
        className="content"
        data-testid="task-item-link"
      >
        <Title level={3}>{title}</Title>
        <div className="task-list-main">
          <p>{description}</p>
          <p>{existingInput}</p>
        </div>
      </StyledNavLink>
      <div
        className={`point ${existingInput ? 'done' : ''} ${
          isCurrent ? 'current' : ''
        }`}
      >
        {existingInput ? (
          <Icon type="Checkmark" data-testid="checkmark" />
        ) : (
          pointNumber
        )}
      </div>
    </li>
  );
};
