// Visualizer middleware
import ExplorerMiddleWare from "./explorer";
import SettingsMiddleWare from "./settings";
import VisualizerMiddleware from "./visualizers";
import CommonMiddleware from "@/UserInterface/redux/middlewares/common";

// Append middelwares to default export array
export default [ExplorerMiddleWare, SettingsMiddleWare, VisualizerMiddleware, CommonMiddleware];
