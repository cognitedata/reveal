// Visualizer middleware
import VisualizerMiddleware from "./visualizers";
import CommonMiddleware from "@/UserInterface/Redux/middlewares/common";

// Append middelwares to default export array
export default [VisualizerMiddleware, CommonMiddleware];
