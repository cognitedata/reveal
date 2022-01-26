import { useState } from 'react';
import {
  Detail,
  Title,
  Dropdown,
  Menu,
  Avatar,
  Label,
  Tooltip,
  Body,
  Icon,
} from '@cognite/cogs.js';

import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { Solution } from '@platypus/platypus-core';
import { StyledSolutionCard } from './elements';
import services from '@platypus-app/di';

type SoluionCardProps = {
  solution: Solution;
  onOpen: (solution: Solution) => void;
  onEdit: (solution: Solution) => void;
  onDelete: (solution: Solution) => void;
};

export const SolutionCard = ({
  solution,
  onDelete,
  onEdit,
  onOpen,
}: SoluionCardProps) => {
  const [visibleDropdown, setVisibleDropdown] = useState<boolean>(false);
  const { t } = useTranslation('solutions');

  const renderMenu = () => {
    return (
      <Dropdown
        visible={visibleDropdown}
        onClickOutside={() => setVisibleDropdown(false)}
        content={
          <Menu>
            <Menu.Item
              onClick={(e) => {
                onEdit(solution);
                setVisibleDropdown(false);
                e.stopPropagation();
              }}
            >
              {t('edit', 'Edit')}
            </Menu.Item>
            <div className="cogs-menu-divider" />
            <Menu.Header>{t('danger_zone', 'Danger zone')}</Menu.Header>
            <Menu.Item
              onClick={(e) => {
                onDelete(solution);
                setVisibleDropdown(false);
                e.stopPropagation();
              }}
              className="delete"
              data-cy="delete-solution-menu-item"
            >
              {t('delete', 'Delete')}
            </Menu.Item>
          </Menu>
        }
      >
        <div className="menuContainer">
          <Icon type="EllipsisHorizontal" size={18} className="menu" />
        </div>
      </Dropdown>
    );
  };

  const renderOwners = () => {
    if (solution.owners.length) {
      return solution.owners?.map((owner) => {
        return (
          <Tooltip content={owner} placement="bottom" key={owner}>
            <Avatar text={owner} className="avatar" />
          </Tooltip>
        );
      });
    }
    return (
      <Body level={2} strong className="owners">
        No owners
      </Body>
    );
  };

  return (
    <StyledSolutionCard
      onClick={() => onOpen(solution)}
      key={solution.id}
      className="z-4"
      data-testid={`solution-card`}
      data-cy={`solution-card`}
    >
      <div className="top">
        <div>
          <Title level={5} className="title" data-cy="solution-card-title">
            {solution.name}
            <span className="version" role="definition">
              <Label size="small" variant="unknown">
                {solution.version || '1.0'}
              </Label>
            </span>
          </Title>
          <Detail>
            {t('solution_last_updated', 'Last updated')}{' '}
            {services().dateUtils.format(solution.createdTime)}
          </Detail>
        </div>
        <div
          onClick={(e) => {
            setVisibleDropdown(true);
            e.stopPropagation();
          }}
          role="menu"
          data-cy="solution-card-menu"
        >
          {renderMenu()}
        </div>
      </div>
      <div>{renderOwners()}</div>
    </StyledSolutionCard>
  );
};
