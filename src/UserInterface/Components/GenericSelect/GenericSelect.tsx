import React from "react";
import { UpDownSelect } from "@/UserInterface/Components/UpDownSelect/UpDownSelect";
import { Box } from "@material-ui/core";
import { ISelectOption } from "../Settings/Types";

const style = {
  width: "100%",
  height: "100%",
};

export function GenericSelect(props: {
  options?: ISelectOption[];
  value?: string;
  onChange?: (val: string) => void;
  disabled?: boolean;
  node: JSX.Element;
}) {
  const { options, value, onChange, disabled, node } = props;

  return (
    <Box className="generic-select" style={style}>
      <UpDownSelect
        options={options}
        value={value}
        disabled={disabled}
        onChange={onChange}
        node={node}
      />
    </Box>
  );
}
