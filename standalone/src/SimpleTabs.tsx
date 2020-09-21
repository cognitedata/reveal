import React from "react";
import { AppBar } from "@material-ui/core";
import Tabs from "@material-ui/core/Tabs";
import Box from "@material-ui/core/Box";
import Tab from "@material-ui/core/Tab";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { Trajectory } from "./Trajectory";
import { BaseModule } from "../../src/Core/Module/BaseModule";
import Button from "@material-ui/core/Button";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    width: "100%",
    height: "100%",
  },
  tab: {
    width: "100%",
    height: "calc(100% - 50px)",
  }
}));

function TabPanel(props: any) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box width={"100%"} height={"100%"}>
          {children}
        </Box>
      )}
    </div>
  );
}



export function SimpleTabs(props: { data: BaseModule, onLoadData: () => void }) {

  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (event: any, newValue: number) => {
    setValue(newValue);
  };

  const loadNewData = () => {
    props.onLoadData();
  }

  return  <div className={classes.root}>
    <AppBar position="static">
      <Toolbar variant="dense">
        <Tabs value={value} onChange={handleChange} aria-label="simple tabs example">
          <Tab label="Blank" {...a11yProps(0)} />
          <Tab label="Trajectory" {...a11yProps(1)} />
        </Tabs>
        { value === 1 &&
          <Box ml={2} >
            <Button variant="contained" onClick={loadNewData}>Load New Data</Button>
          </Box>
        }
      </Toolbar>
    </AppBar>
    <TabPanel value={value} index={0} className={classes.tab}>
      <Typography variant="h3"> Node Visualizer Standalone App </Typography>
      <Typography variant="subtitle1"> Click Trajectory to view the App </Typography>
    </TabPanel>
    <TabPanel value={value} index={1} className={classes.tab}>
      <Trajectory data={props.data}/>
    </TabPanel>
  </div>
}
