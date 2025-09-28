import TestDocumentorClient from "./TestDocumentorClient";

// Required for static export in production
export async function generateStaticParams() {
  return [];
}

export default function TestDocumentor() {
  return <TestDocumentorClient />;
}