export interface MapToolsProp {
  disabled?: boolean;
  text: string;
}

export interface DrawMode {
  state?: 'draw_free_polygon' | 'draw_line_string';
}
