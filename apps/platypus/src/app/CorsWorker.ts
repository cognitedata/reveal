/**
 * Wrapper class that loads a worker from a different origin.
 * This is needed because we want to use import map overrides to:
 * - use dev.fusion and override app to work locally
 * - load worker in preview envs (again different origin)
 * - load worker on same origin in prod
 */
export class CorsWorker {
  private worker: Worker | undefined;
  private workerUrl: string;

  constructor(filePath: string) {
    // the fusion-shell app is loaded on ex: dev.fusion
    // but we need to instruct the code to load the worker from firebase url instead
    // so we can point to the correct file (ex: platypus.cogniteapp.com/worker.js)
    const firebaseUrl = new URL('./CorsWorker', import.meta.url).origin;
    const modifiedUrl = new URL(filePath, firebaseUrl);
    this.workerUrl = modifiedUrl.toString();
  }

  getWorker() {
    if (this.worker) {
      return Promise.resolve(this.worker);
    }

    /**
     * Web workers have strict CORS policies (same-origin)
     * It turns out that the only way to load a worker from a different origin
     * is to download the contents and create a blob from it.
     */
    return fetch(this.workerUrl)
      .then((workerResponse) => workerResponse.text())
      .then((workerSource) => {
        this.worker = new Worker(
          URL.createObjectURL(this.createBlob(workerSource))
        );
        return this.worker;
      });
  }

  private createBlob(workerSource: string): Blob {
    let workerBlob;
    try {
      workerBlob = new Blob([workerSource], {
        type: 'application/javascript',
      });
    } catch (e) {
      // Backwards-compatibility
      // prettier-ignore
      // @ts-ignore
      window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
      // @ts-ignore
      workerBlob = new BlobBuilder();
      workerBlob.append(workerSource);
      workerBlob = workerBlob.getBlob();
    }

    return workerBlob;
  }
}
