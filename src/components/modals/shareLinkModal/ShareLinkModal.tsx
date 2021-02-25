import React, { useState, useRef } from 'react';
import Modal from 'components/modals/simpleModal/Modal';
import { useDispatch } from 'react-redux';
import { modalClose } from 'store/modals/actions';
import { RootDispatcher } from 'store/types';
import { Body, Button } from '@cognite/cogs.js';
import { Board, Suite } from 'store/suites/types';
import {
  ShareURLInput,
  ShareURLInputContainer,
} from 'components/modals/elements';
import { useMetrics } from 'utils/metrics';
import { useLink } from 'hooks';

interface Props {
  board: Board;
  suite: Suite;
}
const ModalWidth = 528;

const ShareLinkModal: React.FC<Props> = ({ board, suite }: Props) => {
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const ref = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch<RootDispatcher>();
  const metrics = useMetrics('ShareBoard');
  const { createLink } = useLink();
  const handleCloseModal = () => {
    dispatch(modalClose());
  };
  let entity = '';
  let url = '';
  let title = '';
  if (board) {
    entity = 'board';
    ({ url, title } = board);
  } else if (suite) {
    entity = 'suite';
    ({ title } = suite);
    url = createLink(`/suites/${suite.key}`);
  }

  const copyToClipboard = () => {
    if (ref.current) {
      ref.current.select();
      document.execCommand('copy');
      setCopySuccess(true);
      metrics.track('Copied', { boardKey: board.key, board: board.title });
    }
  };

  return (
    <Modal
      visible
      onCancel={handleCloseModal}
      headerText={`Share this ${entity}`}
      hasFooter={false}
      width={ModalWidth}
    >
      <Body>{title}</Body>
      <ShareURLInputContainer>
        <ShareURLInput ref={ref} value={url} readOnly />
        <Button type="primary" variant="ghost" onClick={copyToClipboard}>
          {copySuccess ? 'Copied' : 'Copy'}
        </Button>
      </ShareURLInputContainer>
    </Modal>
  );
};

export default ShareLinkModal;
