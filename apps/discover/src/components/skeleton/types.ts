export interface RectangleProps {
  height?: string;
  width?: string;
}

export interface CircleProps {
  diameter?: string;
}

export interface BaseType {
  Rectangle: React.FC<RectangleProps>;
  Circle: React.FC<CircleProps>;
}
