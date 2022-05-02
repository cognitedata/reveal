import styled from 'styled-components/macro';

import { Textarea, AutoComplete } from '@cognite/cogs.js';

import {
  MODAL_PADDING,
  ModalFullWidthContainer,
} from 'components/Modal/elements';
import { Typography } from 'components/Typography';
import { FlexColumn, sizes } from 'styles/layout';
import { DURATION } from 'styles/transition';

export const FeedbackIntroTitle = styled(ModalFullWidthContainer)`
  background-color: var(--cogs-greyscale-grey1);
  margin-top: -${MODAL_PADDING};
  margin-bottom: 20px;
`;

export const ImminentRemoveNote = styled(ModalFullWidthContainer)`
  background-color: var(--cogs-red-7);
  margin-top: -${MODAL_PADDING};
  margin-bottom: ${MODAL_PADDING};
  text-align: center;

  height: 0;
  padding: 0px;
  opacity: 0;
  transition: height ${DURATION.SLOW} ease-in-out,
    padding ${DURATION.SLOW} ease-in-out, opacity ${DURATION.SLOW} ease-in-out;
  transition-delay: -100ms;

  ${(props: { visible: boolean }) =>
    props.visible &&
    `
    height: auto;
    opacity: 1;
    padding: 10px;
  `}
`;

export const FeedbackActionTitle = styled(Typography)`
  font-size: 14px;
  font-weight: 600 !important;
  line-height: 20px !important;
  margin-bottom: 12px !important;
`;

export const ItemRow = styled(FlexColumn)`
  margin-bottom: ${sizes.normal};
`;

export const TinyText = styled(Typography)`
  margin-top: ${sizes.normal} !important;
  margin-bottom: ${sizes.small} !important;
`;

export const CurrentDocumentTypeText = styled(TinyText)`
  text-decoration-line: ${(props: { stale: boolean }) =>
    props.stale ? 'line-through' : 'none'};
`;

export const CorrectDocumentTypeSelect = styled(AutoComplete)`
  cursor: pointer;
  & .cogs-select__option:hover {
    cursor: pointer;
  }
  & .cogs-select__control {
    border: 2px solid var(--cogs-greyscale-grey4) !important;
    background-color: var(--cogs-white);
  }
`;

export const AdditionalFeedback = styled(Textarea)`
  display: flex;
  flex-direction: column;
  & .cogs-textarea--title {
    font-weight: 600;
  }
  & textarea {
    min-height: 80px;
  }
`;

export const FeedbackAgreement = styled.div`
  background-color: var(--cogs-bg-status-large--default);
  border-radius: ${sizes.small};
  padding: ${sizes.normal};
  margin-top: ${sizes.normal};
  margin-bottom: ${sizes.normal};
  font-size: 14px;
`;

export const OnlyByAdminText = styled(ModalFullWidthContainer)`
  background-color: var(--cogs-greyscale-grey1);
  margin-bottom: -${MODAL_PADDING};
`;
