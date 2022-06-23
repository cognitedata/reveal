import React from 'react';

import isNumber from 'lodash/isNumber';

import { Dropdown, Menu, Label, LabelVariants } from '@cognite/cogs.js';

import { NoPropagationWrapper } from 'components/Buttons/NoPropagationWrapper';
import { useTranslation } from 'hooks/useTranslation';
import { STATUS } from 'modules/feedback/constants';

interface DropdownButtonProps {
  status: number;
  options: { value: number; display: string }[];
}
const DropdownButton: React.FC<DropdownButtonProps> = ({ status, options }) => {
  const text = options[status].display;
  let color: LabelVariants;

  switch (status) {
    case STATUS.Resolved:
      color = 'success';
      break;

    case STATUS.New:
      color = 'normal';
      break;

    default:
      color = 'unknown';
      break;
  }

  return (
    <Label
      size="medium"
      iconPlacement="right"
      icon="ChevronDownLarge"
      variant={color}
      aria-label="ChevronDown"
    >
      {text}
    </Label>
  );
};

interface Props {
  status?: number;
  handleChangeFeedbackStatus: (status: number) => void;
}
export const StatusColumn: React.FC<Props> = (props) => {
  const { status, handleChangeFeedbackStatus } = props;
  const [newStatus, setNewStatus] = React.useState<number | null>(null);

  const { t } = useTranslation('Admin');

  const options = [
    { value: STATUS.New, display: t('New') },
    { value: STATUS.Progress, display: t('In Progress') },
    { value: STATUS.Resolved, display: t('Resolved') },
    { value: STATUS.Dismissed, display: t('Dismissed') },
  ];

  const handleStatusChange = (value: number) => {
    setNewStatus(value);
    handleChangeFeedbackStatus(value);
  };

  // Show the change immediately, even if the API hasn't finished yet
  const visibleStatus = isNumber(newStatus) ? newStatus : status;

  const MenuContent = (
    <Menu>
      {options.map((option) => (
        <Menu.Item
          key={option.value}
          onClick={() => handleStatusChange(option.value)}
          disabled={visibleStatus === option.value}
        >
          {option.display}
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <NoPropagationWrapper>
      <Dropdown content={MenuContent}>
        <DropdownButton
          options={options}
          status={visibleStatus || STATUS.New}
        />
      </Dropdown>
    </NoPropagationWrapper>
  );
};

export default StatusColumn;
