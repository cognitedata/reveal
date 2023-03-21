import { useCallback, useMemo, useState } from 'react';
import { AnnotationType, ToolType } from '@cognite/unified-file-viewer';
import { CanvasAnnotation } from '../types';
import { UseManagedStateReturnType } from './useManagedState';
import { ExactlyOneKey } from '../utils/ExactlyOneKey';
import { FONT_SIZE, LINE_STROKE_WIDTH } from '../constants';
import filterNotUndefinedValues from '../utils/filterNotUndefinedValues';
import {
  SHAPE_ANNOTATION_FILL_COLOR_MAP,
  SHAPE_ANNOTATION_STROKE_COLOR_MAP,
  TEXT_ANNOTATION_COLOR_MAP,
} from '../colors';

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
};

const getAnnotationWithUpdatedStyle = <T extends CanvasAnnotation>(
  annotation: T,
  updatedAnnotationStyle: ExactlyOneKey<AnnotationStyleByType>
): T => {
  switch (annotation.type) {
    case AnnotationType.RECTANGLE: {
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
        style: {
          ...annotation.style,
          ...updatedAnnotationStyle.line,
        },
      };
    }
    default:
      throw new Error(
        'Unsupported annotation type for updating style' + annotation.type
      );
  }
};

type AnnotationStyleByType = {
  shape: ShapeAnnotationStyle;
  text: TextAnnotationStyle;
  line: LineAnnotationStyle;
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

const DEFAULT_TOOL_OPTIONS: Record<ToolType, ToolOptions> = {
  [ToolType.RECTANGLE]: DEFAULT_STYLE,
  [ToolType.ELLIPSE]: DEFAULT_STYLE,
  [ToolType.POLYLINE]: {
    stroke: TEXT_ANNOTATION_COLOR_MAP.BLUE,
    strokeWidth: LINE_STROKE_WIDTH.MEDIUM,
    isWorkspaceAnnotation: true,
  },
  [ToolType.TEXT]: {
    fontSize: FONT_SIZE['18px'],
    fill: TEXT_ANNOTATION_COLOR_MAP.BLACK,
    isWorkspaceAnnotation: true,
  },
  [ToolType.SELECT]: DEFAULT_STYLE,
  [ToolType.LINE]: DEFAULT_STYLE,
  [ToolType.IMAGE]: {},
  [ToolType.PAN]: {},
};

const useManagedTools = ({
  initialTool,
  selectedCanvasAnnotation,
  onUpdateRequest,
}: {
  initialTool: ToolType;
  selectedCanvasAnnotation: CanvasAnnotation | undefined;
  onUpdateRequest: UseManagedStateReturnType['onUpdateRequest'];
}): {
  tool: ToolType;
  toolOptions: ToolOptions;
  setTool: (nextTool: ToolType, options?: ToolOptions) => void;
  onUpdateAnnotationStyleByType: OnUpdateAnnotationStyleByType;
} => {
  const [tool, setTool] = useState<ToolType>(initialTool);

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

          if (selectedCanvasAnnotation) {
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
    if (tool === ToolType.SELECT || tool === ToolType.PAN) {
      return DEFAULT_TOOL_OPTIONS[tool];
    }

    if (tool === ToolType.RECTANGLE) {
      return {
        ...DEFAULT_TOOL_OPTIONS[tool],
        ...filterNotUndefinedValues(activeAnnotationStyleByType.shape),
      };
    }

    if (tool === ToolType.TEXT) {
      return {
        ...DEFAULT_TOOL_OPTIONS[tool],
        ...filterNotUndefinedValues(activeAnnotationStyleByType.text),
      };
    }

    if (tool === ToolType.LINE) {
      return {
        ...DEFAULT_TOOL_OPTIONS[tool],
        ...filterNotUndefinedValues(activeAnnotationStyleByType.line),
      };
    }

    throw new Error('Unsupported tool type: ' + tool);
  }, [tool, activeAnnotationStyleByType]);

  return {
    tool,
    toolOptions,
    setTool,
    onUpdateAnnotationStyleByType,
  };
};

export default useManagedTools;
