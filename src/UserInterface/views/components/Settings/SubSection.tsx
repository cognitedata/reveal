import React from "react";
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

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
      padding: "0.5rem 0"
    },
    formField: {
      flex: 1,
      display: "flex",
      position: "relative",
      marginBottom: "0.1rem"
    },
    formLabel: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      marginLeft: ".5rem",
      fontSize: ".7rem",
      fontWeight: 400
    },
    formInput: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      position: "relative"
    },
    inputText: {
      height: "0.9rem",
      borderWidth: "1.2px",
      borderColor: "#c4c4c4",
      borderStyle: "solid",
      fontSize: ".6rem",
      padding: ".1rem",
      width: "90%",
      fontWeight: 700
    },
    checkbox: {
      position: "absolute",
      left: "-.8rem"
    }
  }),
);


export default function SubSection()
{
  const classes = useStyles();
  return <div className={classes.formContainer}>
    <section className={classes.formField}>
      <div className={classes.formLabel}>
        <label>Name:</label>
      </div>
      <div className={classes.formInput}>
        <input className={classes.inputText}></input>
      </div>
    </section>
    {/* <section className={classes.formField}>
      <div className={classes.formLabel}>
        <label>Color:</label>
      </div>
      <div className={classes.formInput}>
        <CompactColorPicker></CompactColorPicker>
      </div>
    </section> */}
    <section className={classes.formField}>
      <div className={classes.formLabel}>
        <label>Type Name:</label>
      </div>
      <div className={classes.formInput}>
        <input className={classes.inputText}></input>
      </div>
    </section>
    <section className={classes.formField}>
      <div className={classes.formLabel}>
        <label>Data type:</label>
      </div>
      <div className={classes.formInput}>
        <input className={classes.inputText}></input>
      </div>
    </section>
    {/* <section className={classes.formField}>
      <div className={classes.formLabel}>
        <label>Measurement:</label>
      </div>
      <div className={classes.formInput}>
        <SketchColorPicker></SketchColorPicker>
      </div>
    </section> */}
    {/* <section className={classes.formField}>
      <div className={classes.formLabel}>
        <label>Private color table:</label>
      </div>
      <div className={classes.formInput}>
        <input type="checkbox" className={classes.checkbox}></input>
        <SketchColorPicker></SketchColorPicker>
      </div>
    </section> */}
  </div>
} 