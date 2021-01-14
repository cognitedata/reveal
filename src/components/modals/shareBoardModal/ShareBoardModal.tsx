import React, { useState, useRef } from 'react';
import Modal from 'components/modals/simpleModal/Modal';
import { useDispatch } from 'react-redux';
import { modalClose } from 'store/modals/actions';
import { RootDispatcher } from 'store/types';
import { Body, Button } from '@cognite/cogs.js';
import { Board } from 'store/suites/types';
import {
  ShareURLInput,
  ShareURLInputContainer,
} from 'components/modals/elements';

interface Props {
  board: Board;
}
const ModalWidth = 528;

const ShareBoardModal: React.FC<Props> = ({ board }: Props) => {
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const ref = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch<RootDispatcher>();
  const handleCloseModal = () => {
    dispatch(modalClose());
  };
  const copyToClipboard = () => {
    if (ref.current) {
      ref.current.select();
      document.execCommand('copy');
      setCopySuccess(true);
    }
  };

  return (
    <Modal
      visible
      onCancel={handleCloseModal}
      headerText="Share this board"
      hasFooter={false}
      width={ModalWidth}
    >
      {copySuccess && <Body level={2}>Link copied to clipboard</Body>}
      <ShareURLInputContainer>
        <ShareURLInput ref={ref} value={board.url} readOnly />
        <Button type="primary" variant="ghost" onClick={copyToClipboard}>
          {copySuccess ? 'Copied' : 'Copy'}
        </Button>
      </ShareURLInputContainer>
    </Modal>
  );
};

export default ShareBoardModal;
