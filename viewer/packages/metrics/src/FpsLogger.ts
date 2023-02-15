import { throttle } from "lodash";


export class FpsLogger {
    private wasPreviousAnimationFrameRendered = false;
    private renderedFrames = 0;
    private renderedFramesStartTime = 0;

    private throttledTrack = throttle((fpsValue: number) => console.log('fps', fpsValue), 2000);

    tickCurrentAnimationFrame(isRendered: boolean): void {
        if (!isRendered) {
            this.renderedFrames = 0;
            this.wasPreviousAnimationFrameRendered = false;
        }

        if (this.wasPreviousAnimationFrameRendered) {
            this.renderedFrames++;
        } else {
            this.renderedFramesStartTime = Date.now();
            this.wasPreviousAnimationFrameRendered = true;
        }
    }

    trackCurrentAverageFps(): void {
        if (this.wasPreviousAnimationFrameRendered && this.renderedFrames > 30) {
            const currentSegmentTime = Date.now() - this.renderedFramesStartTime;
            const currentSegmentFPS = this.renderedFrames * (1 / currentSegmentTime) * 1000;
            
            this.throttledTrack(currentSegmentFPS);
        }
    }

}