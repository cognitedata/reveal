import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";

// Visualizer component state interface
export interface VisualizerStateInterface {
    toolBars: { [key: string]: any[] },
    targets: { [key: string]: ThreeRenderTargetNode }
}
