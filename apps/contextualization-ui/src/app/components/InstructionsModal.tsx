import { Dispatch, SetStateAction } from 'react';

import styled from 'styled-components';

import { Body, Modal } from '@cognite/cogs.js';

export const InstructionsModal = ({
  instructionsVisibility,
  setInstructionsVisibility,
}: {
  instructionsVisibility: boolean;
  setInstructionsVisibility: Dispatch<SetStateAction<boolean>>;
}) => (
  <StyledModal
    visible={instructionsVisibility}
    title="Instructions"
    onCancel={() => {
      setInstructionsVisibility(false);
    }}
  >
    <Body level={2}>
      Below, you will find randomly selected instances on the left side. Your
      task is to fill in the corresponding cell on the right side. It's
      important to note that the match follows a one-to-many relationship from
      the reference table. Make sure to carefully analyze the options and select
      the most appropriate match for each instance.
    </Body>
    <br />
    <Body level={2} strong>
      Options for matching:
    </Body>
    <Body level={2}>
      <ul>
        <li>Find the expected match and select that if you're sure</li>
        <li>
          Sure that there should not be a match? Check the checkbox: "No Match"
        </li>
        <li>You're not sure? Leave the match as is.</li>
      </ul>
    </Body>
  </StyledModal>
);

const StyledModal = styled(Modal)`
  .cogs-modal-footer {
    display: none;
  }
`;
