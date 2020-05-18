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
      backgroundImage: "linear-gradient(to right, #fff, #d5d5d5)",
      display: "flex",
      flexDirection: "column",
      padding: "0.5rem"
    },
  }),
);

export default function Form(props: { elements, sectionId, subSectionId }) {
  const { elements, sectionId, subSectionId } = props;
  const classes = useStyles();
  return <div className={classes.formContainer}>
    {elements.map((element, index) => <Input
      key={`${sectionId}-input-${subSectionId ? subSectionId : ""}-${index}`}
      sectionId={sectionId}
      subSectionId={subSectionId}
      config={element}
      elementIndex={index}>
    </Input>)}
  </div>
} 