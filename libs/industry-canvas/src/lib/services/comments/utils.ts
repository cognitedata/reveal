import { $dfs } from '@lexical/utils';
import { EditorState } from 'lexical';
import pickBy from 'lodash/pickBy';

import {
  AnnotationType,
  RectangleAnnotation,
} from '@cognite/unified-file-viewer';

import { isNotUndefined } from '../../utils/isNotUndefined';

import { CommentFilter, Comment } from './types';

export const composeFilter = (filter: CommentFilter) =>
  Object.entries(filter)
    .map(([filterKey, filterValue]) => {
      if (filterValue === undefined) {
        return undefined;
      }
      if (filterKey === 'taggedUsers' && Array.isArray(filterValue)) {
        return {
          [filterKey]: { containsAll: filterValue },
        };
      }
      if (
        filterKey === 'parentComment' &&
        typeof filterValue === 'object' &&
        'externalId' in filterValue
      ) {
        return {
          [filterKey]: { externalId: { eq: filterValue.externalId } },
        };
      }
      return { [filterKey]: { eq: filterValue } };
    })
    .filter(isNotUndefined);

export const removeNullEntries = <T extends object>(obj: T): T =>
  pickBy(obj, (value) => value !== null) as T;

export const isNonEmptyString = (str: string | undefined) => {
  if (str !== undefined) {
    return str.trim().length > 0;
  }
  return false;
};

export const createCommentAnnotation = (
  // this function is only used after we filter out comments => contextData property which is why
  // we add ?? after we know that these property won't be undefined
  comment: Comment
): RectangleAnnotation => {
  if (
    comment.contextData?.x === undefined ||
    comment.contextData.y === undefined
  ) {
    throw new Error(
      'Cannot create comment annotation without x & y properties'
    );
  }
  return {
    x: comment.contextData.x,
    y: comment.contextData.y,
    id: comment.externalId,
    type: AnnotationType.RECTANGLE,
    width: 1,
    height: 1,
    style: { fill: 'transparent', stroke: 'transparent' },
  };
};

export const getTextContentFromEditorState = (editorState: EditorState) => {
  let textContent = '';
  editorState.read(() => {
    const nodes = $dfs();

    textContent = nodes.reduce(
      (acc, { node }) => acc + (node.__text || ''),
      ''
    );
  });

  return textContent;
};
