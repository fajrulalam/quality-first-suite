/// <reference lib="webworker" />

self.onmessage = function (e) {
  const { file, chunkSize } = e.data;
  const fileSize = file.size;
  let offset = 0;
  let result = "";

  // Process in chunks
  async function processChunk() {
    if (offset >= fileSize) {
      // Done processing
      self.postMessage({ type: "complete", result });
      return;
    }

    const chunk = file.slice(offset, Math.min(offset + chunkSize, fileSize));
    try {
      const chunkText = await chunk.text();

      // Remove base64 images using a simpler pattern
      let processedChunk = chunkText;
      // Find and remove data:image patterns in src attributes
      processedChunk = processedChunk.replace(/src="data:image[^"]*"/g, 'src=""');
      // Find and remove data:image patterns in href attributes
      processedChunk = processedChunk.replace(/href="data:image[^"]*"/g, 'href=""');

      result += processedChunk;
      offset += chunkSize;

      // Report progress
      const percentComplete = Math.round((offset / fileSize) * 100);
      self.postMessage({ type: "progress", percentComplete });

      // Schedule next chunk processing
      setTimeout(processChunk, 0);
    } catch (error: any) {
      self.postMessage({ type: "error", error: error.message });
    }
  }

  processChunk();
};

export {};
