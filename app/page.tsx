import { DocumentManager } from "@y-sweet/sdk";
import { YDocProvider } from "@y-sweet/react";

import { App } from "@/components/App";

const manager = new DocumentManager(
  process.env.CONNECTION_STRING ||
    "yss://TUQMTe52WRHrLJKw.DFLYmxplphSr92JyJJlHqDufJcKOze@api.jamsocket.com/v2/y-sweet/ainoluu9904/color-grid/",
);

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ doc: string }>;
}) {
  const params = await searchParams;
  const docId = params.doc ?? crypto.randomUUID();

  async function getClientToken() {
    "use server";
    // In a production app, this is where you'd authenticate the user
    // and check that they are authorized to access the doc.
    return await manager.getOrCreateDocAndToken(docId);
  }

  return (
    <YDocProvider docId={docId} authEndpoint={getClientToken}>
      <App />
    </YDocProvider>
  );
}
