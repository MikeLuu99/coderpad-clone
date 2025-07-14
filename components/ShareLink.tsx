"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function ShareLink() {
  const searchParams = useSearchParams();
  const docId = searchParams.get("doc");
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (docId) {
      const newUrl = `${window.location.origin}/?doc=${docId}`;
      setUrl(newUrl);
    }
  }, [docId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!docId) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        readOnly
        value={url}
        className="w-full px-3 py-2 text-sm text-black bg-white border border-black"
      />
      <button
        onClick={handleCopy}
        className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
