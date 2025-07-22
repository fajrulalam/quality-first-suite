// Create and initialize the worker
export const createWorker = (): Worker => {
  // Using new URL() with import.meta.url is the modern, bundler-friendly way to create workers.
  // This ensures that Next.js (or any other bundler) can statically analyze and bundle the worker script.
  return new Worker(new URL("../workers/dataProcessor.worker.ts", import.meta.url));
};