import { useCallback, useMemo, useState } from 'react';
import { RectangleAnnotation, ToolType } from '@cognite/unified-file-viewer';
import { CanvasAnnotation, ShapeAnnotationColor } from '../types';
import { UseManagedStateReturnType } from './useManagedState';
import {
  fillShapeAnnotationColorToHex,
  strokeShapeAnnotationColorToHex,
} from '../utils/colorUtils';

export type ShapeAnnotationStyle = {
  fill: ShapeAnnotationColor;
  stroke: ShapeAnnotationColor;
};
export type OnUpdateShapeAnnotationStyle = (
  updateShapeAnnotationStyle: Partial<ShapeAnnotationStyle>
) => void;

type ToolOptions = Record<string, any>;

const DEFAULT_STYLE = {
  fill: 'rgba(0, 179, 230, 0.5)',
  stroke: '#000000',
  strokeWidth: 3,
  isWorkspaceAnnotation: true,
};

const DEFAULT_TOOL_OPTIONS: Record<ToolType, ToolOptions> = {
  [ToolType.RECTANGLE]: DEFAULT_STYLE,
  [ToolType.ELLIPSE]: DEFAULT_STYLE,
  [ToolType.POLYLINE]: DEFAULT_STYLE,
  [ToolType.TEXT]: {
    strokeWidth: 0,
    fill: '#000000',
    stroke: '#000000',
  },
  [ToolType.SELECT]: DEFAULT_STYLE,
  [ToolType.LINE]: DEFAULT_STYLE,
  [ToolType.IMAGE]: {},
  [ToolType.PAN]: {},
};

type ToolState = {
  tool: ToolType;
  optionsByToolType: Record<ToolType, ToolOptions>;
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
  shapeAnnotationStyle: ShapeAnnotationStyle;
  onUpdateShapeAnnotationStyle: OnUpdateShapeAnnotationStyle;
} => {
  const [{ tool, optionsByToolType }, setToolState] = useState<ToolState>({
    tool: initialTool,
    optionsByToolType: DEFAULT_TOOL_OPTIONS,
  });

  const setTool = useCallback((nextTool: ToolType, options?: ToolOptions) => {
    setToolState((prevState) => ({
      tool: nextTool,
      optionsByToolType: {
        ...prevState.optionsByToolType,
        [nextTool]:
          options === undefined
            ? prevState.optionsByToolType[nextTool]
            : options,
      },
    }));
  }, []);

  const [shapeAnnotationStyle, setShapeAnnotationStyle] =
    useState<ShapeAnnotationStyle>({
      fill: ShapeAnnotationColor.BLUE,
      stroke: ShapeAnnotationColor.BLUE,
    });

  const onUpdateShapeAnnotationStyle: OnUpdateShapeAnnotationStyle =
    useCallback(
      (updateShapeAnnotationStyle) => {
        setShapeAnnotationStyle((prevShapeAnnotationOption) => {
          const nextShapeAnnotationOptions = {
            ...prevShapeAnnotationOption,
            ...updateShapeAnnotationStyle,
          };

          if (selectedCanvasAnnotation) {
            onUpdateRequest({
              containers: [],
              annotations: [
                {
                  ...selectedCanvasAnnotation,
                  style: {
                    ...selectedCanvasAnnotation.style,
                    fill: fillShapeAnnotationColorToHex(
                      nextShapeAnnotationOptions.fill
                    ),
                    stroke: strokeShapeAnnotationColorToHex(
                      nextShapeAnnotationOptions.stroke
                    ),
                  },
                } as RectangleAnnotation, // TODO: Fix typing
              ],
            });
          }
          return nextShapeAnnotationOptions;
        });
      },
      [selectedCanvasAnnotation, onUpdateRequest, setShapeAnnotationStyle]
    );

  const toolOptions = useMemo(() => {
    if (tool === ToolType.SELECT || tool === ToolType.PAN) {
      return optionsByToolType[tool];
    }

    if (tool === ToolType.RECTANGLE) {
      const { fill, stroke } = shapeAnnotationStyle;
      return {
        ...optionsByToolType[tool],
        fill: fillShapeAnnotationColorToHex(fill),
        stroke: strokeShapeAnnotationColorToHex(stroke),
      };
    }

    throw new Error('Unsupported tool type: ' + tool);
  }, [tool, shapeAnnotationStyle, optionsByToolType]);

  return {
    tool,
    toolOptions,
    setTool,
    shapeAnnotationStyle,
    onUpdateShapeAnnotationStyle,
  };
};

export default useManagedTools;
