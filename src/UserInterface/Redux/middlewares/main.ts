// Visualizer middleware
import CommonMiddleware from "@/UserInterface/Redux/middlewares/common";
import VisualizerMiddleware from "./visualizers";

// Append middelwares to default export array
export default [VisualizerMiddleware, CommonMiddleware];
