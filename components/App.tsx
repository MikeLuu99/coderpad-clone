"use client";

import { Hero } from "./Hero";
import { Presence } from "./Presence";
import { Footer } from "./Footer";
import { Todos } from "./Todos";
import { CodeEditor } from "./CodeEditor";
import { ExecutionOutput } from "./ExecutionOutput";
import Header from "./Header";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";
import { ImperativePanelHandle } from "react-resizable-panels";
import { useRef, useState } from "react";

export function App() {
  const outputPanelRef = useRef<ImperativePanelHandle>(null);
  const [isOutputCollapsed, setIsOutputCollapsed] = useState(false);

  const toggleOutputPanel = () => {
    if (outputPanelRef.current) {
      if (isOutputCollapsed) {
        outputPanelRef.current.expand();
      } else {
        outputPanelRef.current.collapse();
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex flex-col gap-4 p-6 border-b border-black">
        <Header
          title="coderpad clone"
          githubLink="https://github.com/MikeLuu99/coderpad-clone"
        />
        {/* <Hero /> */}
        {/* <Presence /> */}
      </header>

      <PanelGroup direction="horizontal" className="flex-1 flex min-h-0">
        <Panel defaultSize={66}>
          <div className="flex-1 h-full">
            <CodeEditor
              isOutputCollapsed={isOutputCollapsed}
              toggleOutputCollapse={toggleOutputPanel}
            />
          </div>
        </Panel>
        {!isOutputCollapsed && (
          <PanelResizeHandle className="w-2 transition-colors" />
        )}
        <Panel
          ref={outputPanelRef}
          collapsible
          defaultSize={34}
          collapsedSize={0}
          onCollapse={() => setIsOutputCollapsed(true)}
          onExpand={() => setIsOutputCollapsed(false)}
        >
          <div className="flex-1 h-full">
            <ExecutionOutput />
          </div>
        </Panel>
      </PanelGroup>

      {/* <Footer /> */}
    </div>
  );
}
