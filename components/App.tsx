import { Hero } from "./Hero";
import { Presence } from "./Presence";
import { Footer } from "./Footer";
import { Todos } from "./Todos";
import { CodeEditor } from "./CodeEditor";
import { ExecutionOutput } from "./ExecutionOutput";
import Header from "./Header";

export function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex flex-col gap-4 p-6 border-b border-gray-200">
        <Header
          title="coderpad clone"
          githubLink="https://github.com/MikeLuu99/coderpad-clone"
        />
        {/* <Hero /> */}
        {/* <Presence /> */}
      </header>

      <div className="flex-1 flex min-h-0">
        <div className="flex-1 border-r border-gray-200">
          <CodeEditor />
        </div>
        <div className="flex-1">
          <ExecutionOutput />
        </div>
      </div>

      {/* <Footer /> */}
    </div>
  );
}
