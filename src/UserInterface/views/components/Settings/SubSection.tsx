import React from "react";
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Input from "../Common/Input";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    formContainer: {
      width: "100%",
      backgroundImage: "linear-gradient(to right, #e9e9e9, #d5d5d5)",
      display: "flex",
      flexDirection: "column",
      padding: "0.5rem"
    },
  }),
);

export default function SubSection(props: { elements, mainId, subIndex })
{
  const { elements, mainId, subIndex } = props;
  const classes = useStyles();
  return <div className={classes.formContainer}>
    {elements.map((element, index) => <Input
      key={`${mainId}-${subIndex}-element-${index}`}
      config={element}
      mainId={mainId}
      subIndex={subIndex}
      index={index}>
    </Input>)}
  </div>
} 