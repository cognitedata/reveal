import { useCallback, useMemo, useState } from 'react';

import { AnnotationType } from '@cognite/unified-file-viewer';
import { PolylineEndType } from '@cognite/unified-file-viewer/dist/core/annotations/types';

import {
  SHAPE_ANNOTATION_FILL_COLOR_MAP,
  SHAPE_ANNOTATION_STROKE_COLOR_MAP,
  STICKY_ANNOTATION_COLOR_MAP,
  TEXT_ANNOTATION_COLOR_MAP,
} from '../colors';
import { FONT_SIZE, LINE_STROKE_WIDTH } from '../constants';
import { CanvasAnnotation, IndustryCanvasToolType } from '../types';
import { ExactlyOneKey } from '../utils/ExactlyOneKey';
import filterNotUndefinedValues from '../utils/filterNotUndefinedValues';

import { UseManagedStateReturnType } from './useManagedState';

export const SHARED_STICKY_TOOL_OPTIONS = {
  width: 200,
  height: 200,
  padding: 4,
  borderRadius: 4,
  borderWidth: 2,
  lineHeight: 1.2,
  shadowColor: 'rgba(79, 82, 104, 0.1)',
  shadowOffset: {
    x: 0,
    y: 1,
  },
  shadowBlur: 16,
  fontSize: '14px',
  color: 'black',
  borderColor: 'rgba(83, 88, 127, 0.24)',
} as const;

export const SHARED_COMMENT_TOOL_OPTIONS = {
  width: 15,
  height: 15,
  padding: 4,
  borderRadius: 30,
  borderWidth: 0,
  lineHeight: 1.2,
  fontSize: '14px',
  color: 'blue',
} as const;

type ShapeAnnotationStyle = {
  fill?: string;
  stroke?: string;
};

type TextAnnotationStyle = {
  fontSize?: string;
  fill?: string;
};

type LineAnnotationStyle = {
  stroke?: string;
  strokeWidth?: number;
  startEndType?: PolylineEndType;
  endEndType?: PolylineEndType;
};

type StickyAnnotationStyle = {
  backgroundColor?: string;
};

const getAnnotationWithUpdatedStyle = <T extends CanvasAnnotation>(
  annotation: T,
  updatedAnnotationStyle: ExactlyOneKey<AnnotationStyleByType>
): T => {
  switch (annotation.type) {
    case AnnotationType.RECTANGLE:
    case AnnotationType.ELLIPSE: {
      if (updatedAnnotationStyle.shape === undefined) {
        throw new Error(
          'Incorrect annotation style for annotation type. This should not happen.'
        );
      }
      return {
        ...annotation,
        style: {
          ...annotation.style,
          ...updatedAnnotationStyle.shape,
        },
      };
    }
    case AnnotationType.TEXT: {
      if (updatedAnnotationStyle.text === undefined) {
        throw new Error(
          'Incorrect annotation style for annotation type. This should not happen.'
        );
      }
      return {
        ...annotation,
        style: {
          ...annotation.style,
          ...updatedAnnotationStyle.text,
        },
      };
    }
    case AnnotationType.POLYLINE: {
      if (updatedAnnotationStyle.line === undefined) {
        throw new Error(
          'Incorrect annotation style for annotation type. This should not happen.'
        );
      }
      return {
        ...annotation,
        startEndType:
          updatedAnnotationStyle.line.startEndType ?? annotation.startEndType,
        endEndType:
          updatedAnnotationStyle.line.endEndType ?? annotation.endEndType,
        style: {
          ...annotation.style,
          ...updatedAnnotationStyle.line,
        },
      };
    }

    case AnnotationType.STICKY: {
      if (updatedAnnotationStyle.sticky === undefined) {
        throw new Error(
          'Incorrect annotation style for annotation type. This should not happen.'
        );
      }

      return {
        ...annotation,
        style: {
          ...annotation.style,
          ...updatedAnnotationStyle.sticky,
        },
      };
    }

    default:
      throw new Error(
        'Unsupported annotation type for updating style ' + annotation.type
      );
  }
};

type AnnotationStyleByType = {
  shape: ShapeAnnotationStyle;
  text: TextAnnotationStyle;
  line: LineAnnotationStyle;
  sticky: StickyAnnotationStyle;
};

export type OnUpdateAnnotationStyleByType = (
  updateAnnotationStyle: ExactlyOneKey<AnnotationStyleByType>
) => void;

type ToolOptions = Record<string, any>;

const DEFAULT_STYLE = {
  fill: SHAPE_ANNOTATION_FILL_COLOR_MAP.BLUE,
  stroke: SHAPE_ANNOTATION_STROKE_COLOR_MAP.BLUE,
  strokeWidth: 3,
  isWorkspaceAnnotation: true,
};

type ToolsOptionsByType = Record<IndustryCanvasToolType, ToolOptions>;

const DEFAULT_TOOL_OPTIONS: ToolsOptionsByType = {
  [IndustryCanvasToolType.RECTANGLE]: DEFAULT_STYLE,
  [IndustryCanvasToolType.ELLIPSE]: DEFAULT_STYLE,
  [IndustryCanvasToolType.POLYLINE]: {
    stroke: TEXT_ANNOTATION_COLOR_MAP.BLUE,
    strokeWidth: LINE_STROKE_WIDTH.MEDIUM,
    isWorkspaceAnnotation: true,
  },
  [IndustryCanvasToolType.TEXT]: {
    fontSize: FONT_SIZE['18px'],
    fill: TEXT_ANNOTATION_COLOR_MAP.BLACK,
    isWorkspaceAnnotation: true,
  },
  [IndustryCanvasToolType.SELECT]: DEFAULT_STYLE,
  [IndustryCanvasToolType.LINE]: {
    ...DEFAULT_STYLE,
    shouldGenerateConnections: true,
  },
  [IndustryCanvasToolType.IMAGE]: {},
  [IndustryCanvasToolType.PAN]: {},
  [IndustryCanvasToolType.STICKY]: {
    ...SHARED_STICKY_TOOL_OPTIONS,
    backgroundColor: STICKY_ANNOTATION_COLOR_MAP.YELLOW,
  },
  [IndustryCanvasToolType.COMMENT]: {
    ...DEFAULT_STYLE,
    fill: 'transparent',
    stroke: 'transparent',
  },
};

export type UseManagedToolsReturnType = {
  toolOptions: ToolOptions;
  onUpdateAnnotationStyleByType: OnUpdateAnnotationStyleByType;
};

const useManagedTools = ({
  tool,
  selectedCanvasAnnotation,
  onUpdateRequest,
}: {
  tool: IndustryCanvasToolType;
  initialToolsOptionsByType?: ToolsOptionsByType;
  selectedCanvasAnnotation: CanvasAnnotation | undefined;
  onUpdateRequest: UseManagedStateReturnType['onUpdateRequest'];
}): UseManagedToolsReturnType => {
  const [toolsOptionsByType] = useState<ToolsOptionsByType>({
    ...DEFAULT_TOOL_OPTIONS,
  });

  const [activeAnnotationStyleByType, setActiveAnnotationStyleByType] =
    useState<AnnotationStyleByType>({
      shape: {
        fill: undefined,
        stroke: undefined,
      },
      text: {
        fontSize: undefined,
      },
      line: {
        stroke: undefined,
        strokeWidth: undefined,
      },
      sticky: {
        backgroundColor: undefined,
      },
    });

  const onUpdateAnnotationStyleByType: OnUpdateAnnotationStyleByType =
    useCallback(
      (updateAnnotationStyle) => {
        setActiveAnnotationStyleByType((prevAnnotationStyle) => {
          const annotationType = Object.keys(
            updateAnnotationStyle
          )[0] as keyof AnnotationStyleByType;
          const nextAnnotationStyleByType = {
            ...prevAnnotationStyle,
            [annotationType]: {
              ...prevAnnotationStyle[annotationType],
              ...updateAnnotationStyle[annotationType],
            },
          };

          if (selectedCanvasAnnotation !== undefined) {
            onUpdateRequest({
              containers: [],
              annotations: [
                getAnnotationWithUpdatedStyle(
                  selectedCanvasAnnotation,
                  updateAnnotationStyle
                ),
              ],
            });
          }
          return nextAnnotationStyleByType;
        });
      },
      [
        selectedCanvasAnnotation,
        onUpdateRequest,
        setActiveAnnotationStyleByType,
      ]
    );

  const toolOptions = useMemo(() => {
    if (
      tool === IndustryCanvasToolType.SELECT ||
      tool === IndustryCanvasToolType.PAN
    ) {
      return DEFAULT_TOOL_OPTIONS[tool];
    }

    if (
      tool === IndustryCanvasToolType.RECTANGLE ||
      tool === IndustryCanvasToolType.ELLIPSE
    ) {
      return {
        ...toolsOptionsByType[tool],
        ...filterNotUndefinedValues(activeAnnotationStyleByType.shape),
      };
    }

    if (tool === IndustryCanvasToolType.TEXT) {
      return {
        ...toolsOptionsByType[tool],
        ...filterNotUndefinedValues(activeAnnotationStyleByType.text),
      };
    }

    if (tool === IndustryCanvasToolType.LINE) {
      return {
        ...toolsOptionsByType[tool],
        ...filterNotUndefinedValues(activeAnnotationStyleByType.line),
      };
    }

    if (tool === IndustryCanvasToolType.STICKY) {
      return {
        ...toolsOptionsByType[tool],
        ...filterNotUndefinedValues(activeAnnotationStyleByType.sticky),
      };
    }
    if (tool === IndustryCanvasToolType.COMMENT) {
      return {
        ...toolsOptionsByType[tool],
        ...filterNotUndefinedValues(activeAnnotationStyleByType.sticky),
      };
    }

    throw new Error('Unsupported tool type: ' + tool);
  }, [tool, activeAnnotationStyleByType, toolsOptionsByType]);

  return {
    toolOptions,
    onUpdateAnnotationStyleByType,
  };
};

export default useManagedTools;
