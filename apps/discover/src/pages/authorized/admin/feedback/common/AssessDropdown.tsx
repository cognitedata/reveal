import * as React from 'react';

import isNumber from 'lodash/isNumber';

import { Dropdown, Menu, Button } from '@cognite/cogs.js';

import { NoPropagationWrapper } from 'components/Buttons/NoPropagationWrapper';
import { Modal } from 'components/Modal';
import { useTranslation } from 'hooks/useTranslation';
import {
  ASSESS,
  ASSESS_DROPDOWN_APPROVE,
  ASSESS_DROPDOWN_APPROVED,
  ASSESS_DROPDOWN_PLACEHOLDER,
  ASSESS_DROPDOWN_REJECT,
  ASSESS_DROPDOWN_REJECTED,
  MODAL_APPROVE_BODY,
  MODAL_APPROVE_BUTTON,
  MODAL_APPROVE_TITLE,
  MODAL_REJECT_BODY,
  MODAL_REJECT_BUTTON,
  MODAL_REJECT_TITLE,
  REASSESS_BUTTON_TEXT,
} from 'modules/feedback/constants';

interface Props {
  assessment?: ASSESS;
  handleChangeAssessment: (status: number) => void;
  clearAssessment: () => void;
}
export const AssessDropdown: React.FC<Props> = ({
  assessment,
  handleChangeAssessment,
  clearAssessment,
}) => {
  const [modalOpen, setModalOpen] = React.useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = React.useState<
    number | undefined
  >();
  const { t } = useTranslation('Admin');

  const handleChange = (status: number) => {
    setSelectedStatus(status);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleOk = () => {
    setModalOpen(false);
    if (isNumber(selectedStatus)) {
      handleChangeAssessment(selectedStatus);
    }
  };

  const handleReAssess = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearAssessment();
  };

  const options = [
    {
      value: ASSESS.Approve,
      display: t(ASSESS_DROPDOWN_APPROVE),
      buttonText: t(ASSESS_DROPDOWN_APPROVED),
    },
    {
      value: ASSESS.Reject,
      display: t(ASSESS_DROPDOWN_REJECT),
      buttonText: t(ASSESS_DROPDOWN_REJECTED),
    },
  ];

  const MenuContent = (
    <Menu>
      {options.map((option) => (
        <Menu.Item
          key={option.value}
          onClick={() => handleChange(option.value)}
          disabled={assessment === option.value}
        >
          {option.display}
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <>
      <NoPropagationWrapper>
        <Dropdown content={MenuContent}>
          <>
            <Button
              iconPlacement="right"
              icon={!isNumber(assessment) ? 'ChevronDownLarge' : undefined}
              type="tertiary"
              disabled={isNumber(assessment)}
              size="small"
              aria-label="Small"
            >
              {assessment !== undefined
                ? options[assessment].buttonText
                : t(ASSESS_DROPDOWN_PLACEHOLDER)}
            </Button>

            {isNumber(assessment) && (
              <Button type="ghost" onClick={handleReAssess}>
                {t(REASSESS_BUTTON_TEXT)}
              </Button>
            )}
          </>
        </Dropdown>
      </NoPropagationWrapper>

      <Modal
        visible={modalOpen}
        thirdWidth
        title={
          selectedStatus === ASSESS.Approve
            ? t(MODAL_APPROVE_TITLE)
            : t(MODAL_REJECT_TITLE)
        }
        onCancel={handleCloseModal}
        okText={
          selectedStatus === ASSESS.Approve
            ? t(MODAL_APPROVE_BUTTON)
            : t(MODAL_REJECT_BUTTON)
        }
        onOk={handleOk}
      >
        <p>
          {t(
            'Objects marked as sensitive in Discover are automatically hidden from view.'
          )}
        </p>
        {selectedStatus === ASSESS.Approve ? (
          <p>{t(MODAL_APPROVE_BODY)}</p>
        ) : (
          <p>{t(MODAL_REJECT_BODY)}</p>
        )}
      </Modal>
    </>
  );
};
