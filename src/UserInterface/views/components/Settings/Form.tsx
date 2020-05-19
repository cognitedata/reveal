import React from "react";
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

import Input from "../Common/Input";
import { SectionElement } from "../../../interfaces/settings";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formContainer: {
      display: "flex",
      flexDirection: "column",
      padding: ".5rem .4rem .5rem .8rem",
      backgroundImage: "linear-gradient(to right, #fff, #d5d5d5)",
    },
  }),
);

/**
 * Settings form component
 */
export default function Form(props: {
  elements: Array<SectionElement>,
  sectionId: number,
  subSectionId?: number
}) {

  const { elements, sectionId, subSectionId } = props;
  const classes = useStyles();

  return <div className={classes.formContainer}>
    {elements.map((element, index) => <Input
      key={`${sectionId}-input-${subSectionId ? subSectionId : ""}-${index}`}
      sectionId={sectionId}
      subSectionId={subSectionId}
      config={element}
      elementIndex={index} />
    )}
  </div>
} 
