import React from "react";
import { connect } from "react-redux";
import { Typography } from "@material-ui/core";

function StatusBar(props: { statusBarText: string }) {
  return (
    <div className="status-bar">
      <div className="status-bar-text">
        <Typography variant="body2" component="label">
          {props.statusBarText}
        </Typography>
      </div>
    </div>
  );
}

function mapStateToProps(state) {
  return { statusBarText: state.visualizers.statusBar.text };
}

export default connect(mapStateToProps)(StatusBar);
