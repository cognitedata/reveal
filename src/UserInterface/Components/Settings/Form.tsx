import React from "react";
import { useSelector } from "react-redux";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";

import {State} from "@/UserInterface/Redux/State/State";
import Input from "@/UserInterface/Components/Input/Input";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formContainer: {
      display: "flex",
      flexDirection: "column",
      padding: ".5rem .4rem .5rem .8rem"
    }
  })
);

/**
 * Settings form component
 */
export default function Form(props: {
  elementIds: string[];
  sectionId: string;
  subSectionId?: string;
}) {
  const classes = useStyles();

  const { elementIds, sectionId, subSectionId } = props;
  const settings = useSelector((state: State) => state.settings); //TODO: Remove reference to state
  const { elements } = settings;

  return (
    <div className={classes.formContainer}>
      {elementIds.map(id => (
        <Input
          key={`${sectionId}-input-${subSectionId ? subSectionId : ""}-${id}`}
          sectionId={sectionId}
          subSectionId={subSectionId}
          config={elements[id]}
          elementIndex={id}
        />
      ))}
    </div>
  );
}
