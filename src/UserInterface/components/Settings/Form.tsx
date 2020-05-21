import React from "react";
import { useSelector } from "react-redux";
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

import Input from "../Common/Input";
import { ReduxStore } from "../../interfaces/common";

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
  elementIds: Array<string>,
  sectionId: string,
  subSectionId?: string
}) {
  const classes = useStyles();
  const { elementIds, sectionId, subSectionId } = props;
  console.log(elementIds);
  const settings = useSelector((state: ReduxStore) => state.settings);
  const { elements } = settings;

  return <div className={classes.formContainer}>
    {elementIds.map((id) => <Input
      key={`${sectionId}-input-${subSectionId ? subSectionId : ""}-${id}`}
      sectionId={sectionId}
      subSectionId={subSectionId}
      config={elements[id]}
      elementIndex={id} />
    )}
  </div>
} 
