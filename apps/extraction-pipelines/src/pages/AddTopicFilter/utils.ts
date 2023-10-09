import { EditorState, SelectionRange } from '@codemirror/state';

type BoundarySummary = {
  line: number;
  column: number;
};

export type SelectionRangeSummary = {
  from: BoundarySummary;
  to: BoundarySummary;
  length: number;
};

const getBoundarySummary = (
  state: EditorState,
  boundary: number
): BoundarySummary => {
  const line = state.doc.lineAt(boundary);
  const lineNumber = line.number;
  const columnNumber = boundary - line.from + 1;

  return {
    line: lineNumber,
    column: columnNumber,
  };
};

export const getSelectionRangeSummary = (
  state: EditorState,
  range: SelectionRange
): SelectionRangeSummary => {
  const fromSummary = getBoundarySummary(state, range.from);
  const toSummary = getBoundarySummary(state, range.to);

  return {
    from: fromSummary,
    to: toSummary,
    length: range.to - range.from,
  };
};
