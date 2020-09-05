import React from "react";
import { UpDownSelect } from "@/UserInterface/Components/GenericSelect/UpDownSelect/UpDownSelect";
import { Box } from "@material-ui/core";
import { CommonSelectBase } from "@/UserInterface/Components/GenericSelect/CommonSelectBase/CommonSelectBase";
import { ICommonSelectProps } from "@/UserInterface/Components/Settings/Types";

const style = {
  width: "100%",
  height: "100%",
};

export function GenericSelect(
  props: ICommonSelectProps & {
    node?: React.ReactElement<ICommonSelectProps, any>;
  }
) {
  const { options, extraOptionsData, value, onChange, disabled, node } = props;
  return (
    <Box className="generic-select" style={style}>
      <UpDownSelect
        options={options}
        value={value}
        disabled={disabled}
        onChange={onChange}
        extraOptionsData={extraOptionsData}
        node={node || <CommonSelectBase />}
      />
    </Box>
  );
}
