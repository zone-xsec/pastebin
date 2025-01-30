importScripts('/h/highlight.js');
importScripts('/h/languages/javascript.min.js')

self.onmessage = function (event) {
  const code = event.data;
  
  // Perform the code highlighting
  const highlightedCode = self.hljs.highlightAuto(code).value;
  
  self.postMessage(highlightedCode);
};
