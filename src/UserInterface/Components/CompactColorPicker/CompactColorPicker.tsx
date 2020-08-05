import React, { useState } from "react";
import { ColorResult, CompactPicker } from "react-color";
import Color from "color";
import "./CompactColorPicker.module.scss";

export default function CompactColorPicker(props: {
  value: string;
  onChange: (id: string, value: Color) => void;
  id: string;
}) {
  const { value: color, id } = props;
  const [visible, setVisibility] = useState(false);

  const handleClose = () => {
    setVisibility(false);
  };

  return (
    <div className="color-picker-container">
      <div className="color-display" onClick={() => setVisibility(!visible)}>
        <span className="color-box" style={{ backgroundColor: color }} />
        <span className="color-name">
          <b>{color}</b>
        </span>
      </div>
      {visible && (
        <div className="color-picker">
          <div className="color-picker-cover" onClick={handleClose} />
          <CompactPicker
            color={color}
            onChangeComplete={(reactColor: ColorResult) => {
              props.onChange(
                id,
                Color({
                  r: reactColor.rgb.r,
                  g: reactColor.rgb.g,
                  b: reactColor.rgb.b,
                })
              );
            }}
          />
        </div>
      )}
    </div>
  );
}
