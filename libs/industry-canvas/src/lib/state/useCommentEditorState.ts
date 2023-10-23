import { create } from 'zustand';

interface IEditor {
  initialEditorState: string;
  setInitialEditorState: (value: string) => void;
}

export const INITIAL_EDITOR_VALUE =
  '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}';
export const useCommentEditorState = create<IEditor>((set) => ({
  initialEditorState: INITIAL_EDITOR_VALUE,
  setInitialEditorState: (value: string) => set({ initialEditorState: value }),
}));
