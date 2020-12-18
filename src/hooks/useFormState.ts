import { useState } from 'react';
import { Suite, Board } from 'store/suites/types';

export const useFormState = (initBoard: Board, initSuite: Suite) => {
  const [board, setBoard] = useState<Board>(initBoard);
  const [suite, setSuite] = useState<Suite>(initSuite);
  return {
    suite,
    setSuite,
    board,
    setBoard,
  };
};
