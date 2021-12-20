import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  CogniteOrnate,
  ShapeSettings as ShapeSettingsType,
  ToolType,
} from '@cognite/ornate';

import { OrnateContextType, PredefinedStyle } from './types';
import { defaultShapeSettings, PREDEFINED_STYLES } from './constants';

type Props = {
  children: React.ReactNode;
};

const OrnateContext = createContext({} as OrnateContextType);

const OrnateContextProvider = ({ children }: Props) => {
  const ornateViewer = useRef<CogniteOrnate>();

  const initOrnate = (instance: CogniteOrnate) => {
    ornateViewer.current = instance;
  };

  const [activeTool, setActiveTool] = useState<ToolType>('default');

  const [shapeSettings, setShapeSettings] =
    useState<ShapeSettingsType>(defaultShapeSettings);

  const [predefinedStyle, setPredefinedStyle] = useState<PredefinedStyle>(
    PREDEFINED_STYLES.find(
      (style) => style.label === shapeSettings[activeTool]?.predefinedStyle
    ) || PREDEFINED_STYLES[0]
  );

  useEffect(() => {
    if (shapeSettings[activeTool]) {
      setPredefinedStyle(
        PREDEFINED_STYLES.find(
          (style) => style.label === shapeSettings[activeTool]?.predefinedStyle
        ) || PREDEFINED_STYLES[0]
      );
    }
  }, [activeTool]);

  const onShapeSettingsChange = useCallback(
    (nextSettings: Partial<ShapeSettingsType>) => {
      ornateViewer.current!.handleShapeSettingsChange(nextSettings);
      setShapeSettings({ ...shapeSettings, ...nextSettings });
    },
    [shapeSettings]
  );

  const { Provider } = OrnateContext;
  return (
    <Provider
      value={{
        ornateViewer,
        shapeSettings,
        setShapeSettings,
        onShapeSettingsChange,
        initOrnate,
        activeTool,
        setActiveTool,
        predefinedStyle,
        setPredefinedStyle,
      }}
    >
      {children}
    </Provider>
  );
};

export { OrnateContext, OrnateContextProvider };
