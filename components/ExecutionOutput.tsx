"use client";

import React, { useMemo, useState } from "react";
import { useYDoc, useAwareness } from "@y-sweet/react";

interface ExecutionResult {
  id: string;
  status: string;
  language: string;
  userId?: string;
  timestamp: number;
  output?: string;
  error?: string;
}

interface ExecutionOutputProps {
  isRunning?: boolean;
}

export function ExecutionOutput({ isRunning = false }: ExecutionOutputProps) {
  const yDoc = useYDoc();
  const awareness = useAwareness();
  const executionResults = useMemo(() => yDoc.getArray("executions"), [yDoc]);
  const [results, setResults] = React.useState<ExecutionResult[]>([]);
  const [userColors] = React.useState(() => new Map<string, string>());
  const [collapsedResults, setCollapsedResults] = useState<Set<string>>(
    new Set(),
  );

  React.useEffect(() => {
    const updateResults = () => {
      setResults(executionResults.toArray() as ExecutionResult[]);
    };

    updateResults();
    executionResults.observe(updateResults);

    return () => {
      executionResults.unobserve(updateResults);
    };
  }, [executionResults]);

  const latestResult = results[results.length - 1];

  const formatOutput = (output: string) => {
    if (!output) return null;

    return output.split("\n").map((line, index) => (
      <div key={index} className="font-mono text-sm">
        {line || "\u00A0"}
      </div>
    ));
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getUserColor = (userId?: string) => {
    if (!userId) return "#000000"; // black

    if (!userColors.has(userId)) {
      userColors.set(userId, "#000000");
    }

    return userColors.get(userId)!;
  };

  const getUserIndicator = (userId?: string) => {
    if (!userId) return null;

    const color = getUserColor(userId);
    const initial = userId.charAt(0).toUpperCase();

    return (
      <div
        className="w-6 h-6 flex items-center justify-center text-white text-xs font-medium"
        style={{ backgroundColor: color }}
        title={`Executed by user ${userId}`}
      >
        {initial}
      </div>
    );
  };

  const handleClearOutput = () => {
    if (executionResults && results.length > 0) {
      executionResults.delete(0, results.length);
    }
  };

  const toggleResultCollapse = (id: string) => {
    setCollapsedResults((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="h-full flex flex-col text-black">
      <div className="p-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-black">Output</h3>
          <div className="flex items-center gap-2">
            {isRunning && (
              <div className="flex items-center gap-2 text-black">
                <div className="w-2 h-2 bg-black animate-pulse"></div>
                <span className="text-sm">Running...</span>
              </div>
            )}
            {results.length > 0 && (
              <>
                <span className="text-xs text-black">
                  {results.length} execution{results.length !== 1 ? "s" : ""}
                </span>
                <button
                  onClick={handleClearOutput}
                  className="px-2 py-1 text-xs bg-white hover:bg-gray-200 text-black border border-black transition-colors"
                  title="Clear all output"
                >
                  Clear
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {results.length === 0 && !isRunning ? (
          <div className="p-4 text-black text-center">
            <div className="text-4xl mb-2">▶️</div>
            <p>Click "Run Code" to execute your code</p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {results.map((result) => (
              <div
                key={result.id}
                className={`border-l-4 pl-4 py-2 ${
                  result.status === "completed"
                    ? "border-black"
                    : "border-black"
                }`}
              >
                <div
                  className="flex items-center justify-between mb-2 cursor-pointer"
                  onClick={() => toggleResultCollapse(result.id)}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 ${
                        result.status === "completed" ? "bg-black" : "bg-black"
                      }`}
                    ></span>
                    <span className="text-sm font-medium capitalize">
                      {result.status}
                    </span>
                    <span className="text-xs text-black">
                      {result.language}
                    </span>
                    {getUserIndicator(result.userId)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-black">
                      {formatTimestamp(result.timestamp)}
                    </span>
                    <button className="text-black">
                      {collapsedResults.has(result.id) ? "▼" : "▲"}
                    </button>
                  </div>
                </div>

                {!collapsedResults.has(result.id) && (
                  <>
                    {result.output && (
                      <div className="mb-2">
                        <div className="text-xs text-black mb-1">Output:</div>
                        <div className="bg-gray-100 p-2 text-black">
                          {formatOutput(result.output)}
                        </div>
                      </div>
                    )}

                    {result.error && (
                      <div>
                        <div className="text-xs text-black mb-1">Error:</div>
                        <div className="bg-gray-100 p-2 text-black">
                          {formatOutput(result.error)}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {latestResult && (
        <div className="border-t border-black p-2">
          <div className="text-xs text-black">
            Last execution: {formatTimestamp(latestResult.timestamp)} • Status:{" "}
            <span
              className={`${
                latestResult.status === "completed"
                  ? "text-black"
                  : "text-black"
              }`}
            >
              {latestResult.status}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
