"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Editor } from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
import { useYDoc, useAwareness } from "@y-sweet/react";
import { editor } from "monaco-editor";
import * as monaco from "monaco-editor";
import { getJudge0Service, ExecutionResult, Judge0Service } from "@/lib/judge0";
import { languageTemplates } from "@/lib/code-templates";

interface CodeEditorProps {
  isOutputCollapsed?: boolean;
  toggleOutputCollapse?: () => void;
}

export function CodeEditor({
  isOutputCollapsed,
  toggleOutputCollapse,
}: CodeEditorProps) {
  const yDoc = useYDoc();
  const awareness = useAwareness();
  const [editorRef, setEditorRef] =
    useState<editor.IStandaloneCodeEditor | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const sharedText = useMemo(() => yDoc?.getText("content"), [yDoc]);
  const executionResults = useMemo(() => yDoc?.getArray("executions"), [yDoc]);
  const sharedSettings = useMemo(() => yDoc?.getMap("settings"), [yDoc]);
  const [judge0Service, setJudge0Service] = useState<Judge0Service | null>(
    null,
  );

  useEffect(() => {
    try {
      const service = getJudge0Service();
      setJudge0Service(service);
    } catch (error) {
      console.error("Failed to initialize Judge0 service:", error);
    }
  }, []);

  // Listen for shared language changes
  useEffect(() => {
    if (!sharedSettings) return;

    const handleSharedLanguageChange = () => {
      const sharedLanguage = sharedSettings.get("language") as string;
      if (sharedLanguage && sharedLanguage !== selectedLanguage) {
        setSelectedLanguage(sharedLanguage);
        if (editorRef) {
          const model = editorRef.getModel();
          if (model) {
            monaco.editor.setModelLanguage(model, sharedLanguage);
          }
        }
      }
    };

    // Initialize with shared language if it exists
    const initialLanguage = sharedSettings.get("language") as string;
    if (initialLanguage) {
      setSelectedLanguage(initialLanguage);
    } else {
      // Set default language in shared state
      sharedSettings.set("language", selectedLanguage);
    }

    sharedSettings.observe(handleSharedLanguageChange);
    return () => sharedSettings.unobserve(handleSharedLanguageChange);
  }, [sharedSettings, selectedLanguage, editorRef]);

  useEffect(() => {
    if (!editorRef) return;

    const binding = new MonacoBinding(
      sharedText,
      editorRef.getModel() as editor.ITextModel,
      new Set([editorRef]),
      awareness,
    );

    return () => binding.destroy();
  }, [editorRef, sharedText, awareness]);

  const handleEditorMount = useCallback(
    (editor: editor.IStandaloneCodeEditor) => {
      setEditorRef(editor);
    },
    [],
  );

  const handleRunCode = useCallback(async () => {
    if (!editorRef || isRunning || !judge0Service) return;

    const code = editorRef.getValue();
    if (!code.trim()) return;

    setIsRunning(true);

    try {
      const response = await fetch("/api/sandbox-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          language: selectedLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ExecutionResult = await response.json();

      // Add user ID from awareness for user tracking
      const userId =
        awareness.getLocalState()?.user?.id ||
        `user-${Math.random().toString(36).substring(2, 11)}`;
      const resultWithUser = { ...result, userId };

      // Add result to Y-Sweet shared array for real-time sync
      if (executionResults) {
        executionResults.push([resultWithUser]);
      }
    } catch (error) {
      const userId =
        awareness.getLocalState()?.user?.id ||
        `user-${Math.random().toString(36).substring(2, 11)}`;
      const errorResult: ExecutionResult = {
        id: crypto.randomUUID(),
        code,
        output: "",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        status: "failed",
        timestamp: Date.now(),
        language: selectedLanguage,
        userId,
      };
      if (executionResults) {
        executionResults.push([errorResult]);
      }
    } finally {
      setIsRunning(false);
    }
  }, [
    editorRef,
    isRunning,
    selectedLanguage,
    executionResults,
    judge0Service,
    awareness,
  ]);

  const handleLanguageChange = useCallback(
    (language: string) => {
      setSelectedLanguage(language);

      // Update shared state so all users see the change
      if (sharedSettings) {
        sharedSettings.set("language", language);
      }

      if (editorRef) {
        const model = editorRef.getModel();
        if (model) {
          monaco.editor.setModelLanguage(model, language);
          const currentValue = editorRef.getValue();
          if (
            currentValue.trim() === "" ||
            currentValue.trim() === "// Start typing here..."
          ) {
            editorRef.setValue(languageTemplates[language]);
          }
        }
      }
    },
    [editorRef, sharedSettings],
  );

  const languageOptions = [
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "go", label: "Go" },
    { value: "cpp", label: "C++" },
    { value: "rust", label: "Rust" },
    { value: "java", label: "Java" },
    { value: "c", label: "C" },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-black p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="font-semibold text-black">Code Editor</h3>
            <select
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="px-3 py-1 border border-black text-sm"
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRunCode}
              disabled={isRunning || !judge0Service}
              className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${
                isRunning || !judge0Service
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-black text-white"
              }`}
            >
              {isRunning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin"></div>
                </>
              ) : (
                <>
                  <span>▶</span>
                </>
              )}
            </button>
            <button
              onClick={toggleOutputCollapse}
              className="px-4 py-2 text-sm bg-black hover:bg-gray-800 text-white border border-white transition-colors"
            >
              {isOutputCollapsed ? "Show Output" : "Hide Output"}
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 h-[40rem]">
        <Editor
          language={selectedLanguage}
          defaultValue="// Start typing here..."
          theme="vs-dark"
          className="h-full w-full"
          onMount={handleEditorMount}
          options={{
            tabSize: 2,
            automaticLayout: true,
            cursorStyle: "line",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
          }}
        />
      </div>
    </div>
  );
}
