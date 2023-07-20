import { useCallback, useMemo, useState } from 'react';

import {
  AnnotationType,
  StickyToolConfig,
  ToolConfig,
  ToolType,
  FontSize,
  PolylineEndType,
} from '@cognite/unified-file-viewer';

import {
  SHAPE_ANNOTATION_FILL_COLOR_MAP,
  SHAPE_ANNOTATION_STROKE_COLOR_MAP,
  STICKY_ANNOTATION_COLOR_MAP,
  TEXT_ANNOTATION_COLOR_MAP,
} from '../colors';
import { DEFAULT_FONT_SIZE } from '../constants';
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
  color: STICKY_ANNOTATION_COLOR_MAP.YELLOW,
  borderColor: 'rgba(83, 88, 127, 0.24)',
} satisfies Omit<StickyToolConfig, 'type'>;

type ShapeAnnotationStyle = {
  fill?: string;
  stroke?: string;
};

type TextAnnotationStyle = {
  fontSize?: FontSize;
  fill?: string;
};

type LineAnnotationStyle = {
  stroke?: string;
  strokeWidth?: number;
  startEndType?: PolylineEndType;
  endEndType?: PolylineEndType;
  dash?: number[];
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

type ToolConfigsByType = Record<IndustryCanvasToolType, ToolConfig>;

const DEFAULT_STYLE = {
  fill: SHAPE_ANNOTATION_FILL_COLOR_MAP.BLUE,
  stroke: SHAPE_ANNOTATION_STROKE_COLOR_MAP.BLUE,
  strokeWidth: 3,
  isWorkspaceAnnotation: true,
};

const DEFAULT_TOOL_CONFIGS_BY_TYPE: ToolConfigsByType = {
  [IndustryCanvasToolType.RECTANGLE]: {
    type: ToolType.RECTANGLE,
    ...DEFAULT_STYLE,
  },
  [IndustryCanvasToolType.ELLIPSE]: {
    type: ToolType.ELLIPSE,
    ...DEFAULT_STYLE,
  },
  [IndustryCanvasToolType.TEXT]: {
    type: ToolType.TEXT,
    fontSize: DEFAULT_FONT_SIZE,
    fill: TEXT_ANNOTATION_COLOR_MAP.BLACK,
    isWorkspaceAnnotation: true,
  },
  [IndustryCanvasToolType.SELECT]: { type: ToolType.SELECT },
  [IndustryCanvasToolType.PAN]: { type: ToolType.PAN },
  [IndustryCanvasToolType.LINE]: {
    type: ToolType.LINE,
    ...DEFAULT_STYLE,
    shouldGenerateConnections: true,
  },
  [IndustryCanvasToolType.STICKY]: {
    type: ToolType.STICKY,
    ...SHARED_STICKY_TOOL_OPTIONS,
  },
  [IndustryCanvasToolType.COMMENT]: {
    type: ToolType.RECTANGLE,
    fill: 'transparent',
    stroke: 'transparent',
  },
};

export type UseManagedToolsReturnType = {
  tool: ToolConfig;
  onUpdateAnnotationStyleByType: OnUpdateAnnotationStyleByType;
};

const useManagedTools = ({
  toolType,
  selectedCanvasAnnotation,
  onUpdateRequest,
}: {
  toolType: IndustryCanvasToolType;
  selectedCanvasAnnotation: CanvasAnnotation | undefined;
  onUpdateRequest: UseManagedStateReturnType['onUpdateRequest'];
}): UseManagedToolsReturnType => {
  const [toolConfigsByType] = useState<ToolConfigsByType>({
    ...DEFAULT_TOOL_CONFIGS_BY_TYPE,
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

  const tool = useMemo((): ToolConfig => {
    if (
      toolType === IndustryCanvasToolType.SELECT ||
      toolType === IndustryCanvasToolType.PAN
    ) {
      return toolConfigsByType[toolType];
    }

    if (
      toolType === IndustryCanvasToolType.RECTANGLE ||
      toolType === IndustryCanvasToolType.ELLIPSE
    ) {
      return {
        ...toolConfigsByType[toolType],
        ...filterNotUndefinedValues(activeAnnotationStyleByType.shape),
      };
    }

    if (toolType === IndustryCanvasToolType.TEXT) {
      return {
        ...toolConfigsByType[toolType],
        ...filterNotUndefinedValues(activeAnnotationStyleByType.text),
      };
    }

    if (toolType === IndustryCanvasToolType.LINE) {
      return {
        ...toolConfigsByType[toolType],
        ...filterNotUndefinedValues(activeAnnotationStyleByType.line),
      };
    }

    if (toolType === IndustryCanvasToolType.STICKY) {
      return {
        ...toolConfigsByType[toolType],
        ...filterNotUndefinedValues(activeAnnotationStyleByType.sticky),
      };
    }
    if (toolType === IndustryCanvasToolType.COMMENT) {
      return {
        ...toolConfigsByType[toolType],
        ...filterNotUndefinedValues(activeAnnotationStyleByType.sticky),
      };
    }

    throw new Error('Unsupported tool type: ' + tool);
  }, [toolType, activeAnnotationStyleByType, toolConfigsByType]);

  return {
    tool,
    onUpdateAnnotationStyleByType,
  };
};

export default useManagedTools;
