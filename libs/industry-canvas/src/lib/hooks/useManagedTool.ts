import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  EllipseToolConfig,
  LineToolConfig,
  PanToolConfig,
  RectangleToolConfig,
  SelectToolConfig,
  StickyToolConfig,
  TextToolConfig,
  ToolConfig,
  ToolType,
} from '@cognite/unified-file-viewer';

import {
  SHAPE_ANNOTATION_FILL_COLOR_MAP,
  SHAPE_ANNOTATION_STROKE_COLOR_MAP,
  STICKY_ANNOTATION_COLOR_MAP,
  TEXT_ANNOTATION_COLOR_MAP,
} from '../colors';
import { IndustryCanvasToolTypeByShortcutKey } from '../components/ToolbarComponent/ToolbarComponent';
import { DEFAULT_FONT_SIZE } from '../constants';
import { IndustryCanvasToolType } from '../types';
import { ExactlyOnePartial } from '../utils/ExactlyOnePartial';
import shouldFireToolKeyboardShortcut from '../utils/shouldFireToolKeyboardShortcut';

type ToolConfigByType = {
  [IndustryCanvasToolType.RECTANGLE]: RectangleToolConfig;
  [IndustryCanvasToolType.ELLIPSE]: EllipseToolConfig;
  [IndustryCanvasToolType.TEXT]: TextToolConfig;
  [IndustryCanvasToolType.SELECT]: SelectToolConfig;
  [IndustryCanvasToolType.PAN]: PanToolConfig;
  [IndustryCanvasToolType.LINE]: LineToolConfig;
  [IndustryCanvasToolType.STICKY]: StickyToolConfig;
  [IndustryCanvasToolType.COMMENT]: {
    type: ToolType.RECTANGLE;
    fill: 'transparent';
    stroke: 'transparent';
  };
};

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
  backgroundColor: STICKY_ANNOTATION_COLOR_MAP.YELLOW,
  color: 'black',
  borderColor: 'rgba(83, 88, 127, 0.24)',
} satisfies Omit<StickyToolConfig, 'type'>;

const DEFAULT_STYLE = {
  fill: SHAPE_ANNOTATION_FILL_COLOR_MAP.BLUE,
  stroke: SHAPE_ANNOTATION_STROKE_COLOR_MAP.BLUE,
  strokeWidth: 3,
  isWorkspaceAnnotation: true,
};

const DEFAULT_TOOL_CONFIG_BY_TYPE: ToolConfigByType = {
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

export type UseManagedToolReturnType = {
  toolType: IndustryCanvasToolType;
  setToolType: Dispatch<SetStateAction<IndustryCanvasToolType>>;
  tool: ToolConfig;
  updateStyleForToolType: (arg: ExactlyOnePartial<ToolConfigByType>) => void;
};

const useManagedTool = (
  initialIndustryCanvasToolType: IndustryCanvasToolType
): UseManagedToolReturnType => {
  const [toolType, setToolType] = useState<IndustryCanvasToolType>(
    initialIndustryCanvasToolType
  );
  const [toolConfigByType, setToolConfigByType] = useState<ToolConfigByType>({
    ...DEFAULT_TOOL_CONFIG_BY_TYPE,
  });

  const updateStyleForToolType: UseManagedToolReturnType['updateStyleForToolType'] =
    useCallback(
      (arg) => {
        const toolType = Object.keys(arg)[0] as keyof ToolConfigByType;
        const updatedStyle = arg[toolType];
        const toolConfig = toolConfigByType[toolType];

        setToolConfigByType((toolConfigByType) => ({
          ...toolConfigByType,
          [toolType]: {
            ...toolConfig,
            ...updatedStyle,
          },
        }));
      },
      [toolConfigByType]
    );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!shouldFireToolKeyboardShortcut(event)) {
        return;
      }

      const matchingIndustryCanvasToolType =
        IndustryCanvasToolTypeByShortcutKey[event.key];
      if (matchingIndustryCanvasToolType !== undefined) {
        setToolType(matchingIndustryCanvasToolType);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [setToolType]);

  const tool = useMemo((): ToolConfig => {
    return toolConfigByType[toolType];
  }, [toolType, toolConfigByType]);

  return {
    tool,
    updateStyleForToolType,
    toolType,
    setToolType,
  };
};

export default useManagedTool;
