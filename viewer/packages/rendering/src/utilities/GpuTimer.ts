//ported to typescript from https://github.com/playcanvas/engine/blob/main/extras/mini-stats/gpu-timer.js

// eslint-disable-next-line header/header
export class GpuTimer {
  private readonly _gl: WebGL2RenderingContext;
  private readonly _ext: any;
  private readonly enabled: boolean;

  private _frameQueries: [string, WebGLQuery][];
  private _frames: [string, WebGLQuery][][];
  private _timings: [string, number][];
  private _prevTimings: [string, number][];
  private _freeQueries: [string, WebGLQuery][];

  get timings(): number[] {
    return this._timings.map(v => v[1]);
  }

  constructor(context: WebGL2RenderingContext) {
    this._gl = context;
    this._ext = context.getExtension('EXT_disjoint_timer_query_webgl2');
    const isSupported = this._ext !== null;

    this._freeQueries = []; // pool of free queries
    this._frameQueries = []; // current frame's queries
    this._frames = []; // list of previous frame queries

    this._timings = [];
    this._prevTimings = [];

    this.enabled = isSupported;
  }

  // called when context was lost, function releases all context related resources
  public loseContext(): void {
    this._freeQueries = []; // pool of free queries
    this._frameQueries = []; // current frame's queries
    this._frames = []; // list of previous frame queries
  }

  // mark the beginning of the frame
  public begin(name: string): void {
    if (!this.enabled) {
      return;
    }

    // store previous frame's queries
    if (this._frameQueries.length > 0) {
      this.end();
    }

    // check if all in-flight queries have been invalidated
    this.checkDisjoint();

    // resolve previous frame timings
    if (this._frames.length > 0) {
      if (this.resolveFrameTimings(this._frames[0], this._prevTimings)) {
        // swap
        const tmp = this._prevTimings;
        this._prevTimings = this._timings;
        this._timings = tmp;

        // free
        this._freeQueries = this._freeQueries.concat(this._frames.splice(0, 1)[0]);
      }
    }

    this.mark(name);
  }

  // mark
  public mark(name: string): void {
    if (!this.enabled) {
      return;
    }

    // end previous query
    if (this._frameQueries.length > 0) {
      this._gl.endQuery(this._ext.TIME_ELAPSED_EXT);
    }

    // allocate new query and begin
    const query = this.allocateQuery();
    query[0] = name;
    this._gl.beginQuery(this._ext.TIME_ELAPSED_EXT, query[1]);
    this._frameQueries.push(query);
  }

  // end of frame
  public end(): void {
    if (!this.enabled) {
      return;
    }

    this._gl.endQuery(this._ext.TIME_ELAPSED_EXT);
    this._frames.push(this._frameQueries);
    this._frameQueries = [];
  }

  // check if the gpu has been interrupted thereby invalidating all
  // in-flight queries
  private checkDisjoint(): void {
    const disjoint = this._gl.getParameter(this._ext.GPU_DISJOINT_EXT);
    if (disjoint) {
      // return all queries to the free list
      this._freeQueries = [this._frames, [this._frameQueries], [this._freeQueries]].flat(2);
      this._frameQueries = [];
      this._frames = [];
    }
  }

  // either returns a previously free'd query or if there aren't any allocates a new one
  private allocateQuery(): [string, WebGLQuery] {
    return this._freeQueries.length > 0 ? this._freeQueries.splice(-1, 1)[0] : ['', this._gl.createQuery()!];
  }

  // attempt to resolve one frame's worth of timings
  private resolveFrameTimings(frame: [string, WebGLQuery][], timings: [string, number][]): boolean {
    // wait for the last query in the frame to be available
    if (!this._gl.getQueryParameter(frame[frame.length - 1][1], this._gl.QUERY_RESULT_AVAILABLE)) {
      return false;
    }

    for (let i = 0; i < frame.length; ++i) {
      timings[i] = [frame[i][0], this._gl.getQueryParameter(frame[i][1], this._gl.QUERY_RESULT) * 1e-6];
    }

    return true;
  }
}
