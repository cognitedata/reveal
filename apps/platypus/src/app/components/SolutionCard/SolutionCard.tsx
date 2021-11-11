import {
  Detail,
  Title,
  Icon,
  Dropdown,
  Menu,
  Avatar,
  Label,
  Tooltip,
} from '@cognite/cogs.js';
import { useHistory } from 'react-router-dom';

import { DateUtilsImpl } from '@platypus/platypus-infrastructure';

import { useTranslation } from '../../hooks/useTranslation';
import { Solution } from '@platypus/platypus-core';
import { StyledSolutionCard } from './elements';

type SoluionCardProps = {
  solution: Solution;
};

export const SolutionCard = ({ solution }: SoluionCardProps) => {
  const history = useHistory();
  const { t } = useTranslation('solutions');

  const dataUtils = new DateUtilsImpl();

  const onDelete = () => {
    return false;
  };

  const onDuplicate = () => {
    return false;
  };

  const onEdit = () => {
    return false;
  };

  const renderMenu = () => {
    return (
      <Dropdown
        content={
          <Menu>
            <Menu.Item
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
            >
              <span>Duplicate</span>
            </Menu.Item>
            <Menu.Item
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <span>Edit</span>
            </Menu.Item>
            <div className="cogs-menu-divider" />
            <Menu.Header>Danger zone</Menu.Header>
            <Menu.Item
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="delete"
            >
              Delete
            </Menu.Item>
          </Menu>
        }
      >
        <Icon
          type="HorizontalEllipsis"
          size={18}
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="menu"
        />
      </Dropdown>
    );
  };

  const renderOwners = () => {
    return solution.owners?.map((owner) => {
      return (
        <Tooltip content={owner} placement="bottom">
          <Avatar text={owner} key={owner} className="avatar" />
        </Tooltip>
      );
    });
  };

  return (
    <StyledSolutionCard
      onClick={() => history.push(`solutions/${solution.id}`)}
      key={solution.id}
      className="z-4"
    >
      <div className="top">
        <div>
          <Title level={4} className="title">
            {solution.name}
            <span className="version">
              <Label size="small" variant="unknown">
                {solution.version || '1.0'}
              </Label>
            </span>
          </Title>

          <Detail>
            {t('solution_last_updated', 'Last updated')}{' '}
            {dataUtils.parseTimestamp(solution.createdTime)}
          </Detail>
        </div>
        <div>{renderMenu()}</div>
      </div>
      <div>{renderOwners()}</div>
    </StyledSolutionCard>
  );
};
