import React, { useState, useEffect, useCallback } from "react";

interface OutputItem {
  type: "log" | "error" | "warn";
  content: string;
  timestamp: string;
}

const INITIAL_CODE = `// Welcome to JavaScript Compiler
// Write your JavaScript code here and click Run to execute

console.log("Hello, World!");

// Example: Calculate factorial
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

console.log("Factorial of 5:", factorial(5));

// Example: Array operations
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Doubled numbers:", doubled);`;

const CODE_SNIPPETS = {
  "Hello World": `console.log("Hello, World!");`,
  "Variables & Types": `// Variables and data types
let name = "JavaScript";
const version = 2024;
let isAwesome = true;
let items = [1, 2, 3, 4, 5];
let person = { name: "John", age: 30 };

console.log("Language:", name);
console.log("Version:", version);
console.log("Is awesome:", isAwesome);
console.log("Items:", items);
console.log("Person:", person);`,
  Functions: `// Function examples
function greet(name) {
  return \`Hello, \${name}!\`;
}

const add = (a, b) => a + b;

const multiply = function(x, y) {
  return x * y;
};

console.log(greet("Developer"));
console.log("5 + 3 =", add(5, 3));
console.log("4 * 6 =", multiply(4, 6));`,
  "Arrays & Objects": `// Working with arrays and objects
const fruits = ["apple", "banana", "orange"];
const person = {
  name: "Alice",
  age: 25,
  hobbies: ["reading", "coding", "gaming"]
};

// Array methods
console.log("Fruits:", fruits);
console.log("First fruit:", fruits[0]);
fruits.push("grape");
console.log("After adding grape:", fruits);

// Object access
console.log("Person:", person);
console.log("Name:", person.name);
console.log("Hobbies:", person.hobbies.join(", "));`,
  "Loops & Conditionals": `// Loops and conditional statements
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// For loop
console.log("Even numbers:");
for (let i = 0; i < numbers.length; i++) {
  if (numbers[i] % 2 === 0) {
    console.log(numbers[i]);
  }
}

// While loop
let count = 0;
while (count < 3) {
  console.log("Count:", count);
  count++;
}

// For...of loop
console.log("All numbers:");
for (const num of numbers) {
  console.log(num);
}`,
  "Async/Await": `// Asynchronous JavaScript
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchData() {
  console.log("Fetching data...");
  await delay(1000);
  return { id: 1, name: "Sample Data" };
}

async function main() {
  try {
    const data = await fetchData();
    console.log("Data received:", data);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();`,
};

export default function Index() {
  const [code, setCode] = useState(INITIAL_CODE);
  const [output, setOutput] = useState<OutputItem[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showSnippets, setShowSnippets] = useState(false);
  const [selectedSnippet, setSelectedSnippet] = useState("");

  // Load saved state on mount
  useEffect(() => {
    const savedCode = localStorage.getItem("js-compiler-code");
    const savedTheme = localStorage.getItem("js-compiler-theme");

    if (savedCode) {
      setCode(savedCode);
    }
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark");
    }
  }, []);

  // Auto-save code every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem("js-compiler-code", code);
    }, 2000);
    return () => clearInterval(interval);
  }, [code]);

  const runCode = useCallback(() => {
    setIsRunning(true);
    setOutput([]);

    const customConsole = {
      log: (...args: any[]) => {
        setOutput((prev) => [
          ...prev,
          {
            type: "log",
            content: args
              .map((arg) =>
                typeof arg === "object"
                  ? JSON.stringify(arg, null, 2)
                  : String(arg),
              )
              .join(" "),
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      },
      error: (...args: any[]) => {
        setOutput((prev) => [
          ...prev,
          {
            type: "error",
            content: args.map((arg) => String(arg)).join(" "),
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      },
      warn: (...args: any[]) => {
        setOutput((prev) => [
          ...prev,
          {
            type: "warn",
            content: args.map((arg) => String(arg)).join(" "),
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      },
    };

    try {
      const func = new Function("console", code);
      func(customConsole);
    } catch (error: any) {
      setOutput((prev) => [
        ...prev,
        {
          type: "error",
          content: error.message,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    }

    setIsRunning(false);
  }, [code]);

  const clearOutput = () => {
    setOutput([]);
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem("js-compiler-theme", newTheme ? "dark" : "light");
  };

  const loadSnippet = (snippetName: string) => {
    setCode(CODE_SNIPPETS[snippetName as keyof typeof CODE_SNIPPETS]);
    setShowSnippets(false);
    setSelectedSnippet(snippetName);
    localStorage.setItem(
      "js-compiler-code",
      CODE_SNIPPETS[snippetName as keyof typeof CODE_SNIPPETS],
    );
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "code.js";
    a.click();
    URL.revokeObjectURL(url);
  };

  const baseTheme = isDarkMode
    ? {
        background: "rgb(13, 17, 23)",
        foreground: "rgb(255, 255, 255)",
        border: "rgb(33, 38, 45)",
        card: "rgb(22, 27, 34)",
        cardBorder: "rgb(48, 54, 61)",
      }
    : {
        background: "rgb(255, 255, 255)",
        foreground: "rgb(13, 17, 23)",
        border: "rgb(208, 215, 222)",
        card: "rgb(246, 248, 250)",
        cardBorder: "rgb(208, 215, 222)",
      };

  return (
    <div
      className="min-h-screen transition-all duration-300 ease-in-out font-mono"
      style={{
        backgroundColor: baseTheme.background,
        color: baseTheme.foreground,
      }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-50 backdrop-blur-md"
        style={{
          backgroundColor: isDarkMode
            ? "rgba(13, 17, 23, 0.95)"
            : "rgba(255, 255, 255, 0.95)",
          borderBottomColor: baseTheme.border,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3 lg:py-4 border-b">
          <div className="flex items-center justify-between gap-3 lg:gap-6">
            <div className="flex items-center gap-2 lg:gap-4">
              <div
                className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center text-base lg:text-lg font-bold"
                style={{
                  backgroundColor: isDarkMode
                    ? "rgb(121, 192, 255)"
                    : "rgb(9, 105, 218)",
                  color: isDarkMode ? "rgb(13, 17, 23)" : "rgb(255, 255, 255)",
                }}
              >
                JS
              </div>
              <h1 className="text-lg lg:text-2xl font-semibold tracking-tight">
                JavaScript Compiler
              </h1>
            </div>

            <div className="flex items-center gap-2 lg:gap-3">
              {/* Snippets Button */}
              <button
                onClick={() => setShowSnippets(!showSnippets)}
                className="px-2 lg:px-4 py-2 rounded-md border text-xs lg:text-sm font-medium transition-all duration-200 flex items-center gap-1 lg:gap-2"
                style={{
                  backgroundColor: baseTheme.card,
                  borderColor: baseTheme.cardBorder,
                  color: baseTheme.foreground,
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="lg:w-4 lg:h-4"
                >
                  <path d="M2 4.75C2 3.784 2.784 3 3.75 3h8.5c.966 0 1.75.784 1.75 1.75v6.5A1.75 1.75 0 0112.25 13h-8.5A1.75 1.75 0 012 11.25v-6.5zm1.75-.25a.25.25 0 00-.25.25v6.5c0 .138.112.25.25.25h8.5a.25.25 0 00.25-.25v-6.5a.25.25 0 00-.25-.25h-8.5z"></path>
                  <path d="M6.5 6.5a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z"></path>
                </svg>
                <span className="hidden sm:inline">Snippets</span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md border transition-all duration-200 flex items-center justify-center"
                style={{
                  backgroundColor: baseTheme.card,
                  borderColor: baseTheme.cardBorder,
                  color: baseTheme.foreground,
                }}
              >
                {isDarkMode ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M8 12a4 4 0 110-8 4 4 0 010 8zM8 0a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0V.75A.75.75 0 018 0zm0 13a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 018 13zM2.343 2.343a.75.75 0 011.061 0l1.06 1.061a.75.75 0 01-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06zm9.193 9.193a.75.75 0 011.06 0l1.061 1.06a.75.75 0 01-1.06 1.061l-1.061-1.06a.75.75 0 010-1.061zM16 8a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0116 8zM3 8a.75.75 0 01-.75.75H.75a.75.75 0 010-1.5h1.5A.75.75 0 013 8zm10.657-5.657a.75.75 0 010 1.061l-1.061 1.06a.75.75 0 11-1.06-1.06l1.06-1.06a.75.75 0 011.061 0zm-9.193 9.193a.75.75 0 010 1.06l-1.06 1.061a.75.75 0 11-1.061-1.06l1.06-1.061a.75.75 0 011.061 0z"></path>
                  </svg>
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M6 .278a.768.768 0 01.08.858 7.208 7.208 0 00-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 01.81.316.733.733 0 01-.031.893A8.349 8.349 0 018.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 016 .278z"></path>
                  </svg>
                )}
              </button>

              {/* Download Button */}
              <button
                onClick={downloadCode}
                className="px-2 lg:px-4 py-2 rounded-md text-white text-xs lg:text-sm font-medium transition-all duration-200 flex items-center gap-1 lg:gap-2"
                style={{
                  backgroundColor: isDarkMode
                    ? "rgb(26, 127, 55)"
                    : "rgb(31, 136, 61)",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="lg:w-4 lg:h-4"
                >
                  <path d="M7.47 10.78a.75.75 0 001.06 0l3.75-3.75a.75.75 0 00-1.06-1.06L8.75 8.44V1.75a.75.75 0 00-1.5 0v6.69L4.78 5.97a.75.75 0 00-1.06 1.06l3.75 3.75zM3.75 13a.75.75 0 000 1.5h8.5a.75.75 0 000-1.5h-8.5z"></path>
                </svg>
                <span className="hidden sm:inline">Download</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Snippets Dropdown */}
      {showSnippets && (
        <div
          className="fixed top-20 right-6 z-50 rounded-lg border shadow-xl min-w-[200px] max-h-[300px] overflow-y-auto p-2"
          style={{
            backgroundColor: baseTheme.background,
            borderColor: baseTheme.cardBorder,
          }}
        >
          {Object.keys(CODE_SNIPPETS).map((snippetName) => (
            <button
              key={snippetName}
              onClick={() => loadSnippet(snippetName)}
              className="w-full p-2 rounded text-left text-sm transition-all duration-200 mb-1"
              style={{
                backgroundColor:
                  selectedSnippet === snippetName
                    ? isDarkMode
                      ? "rgb(121, 192, 255)"
                      : "rgb(9, 105, 218)"
                    : "transparent",
                color:
                  selectedSnippet === snippetName
                    ? isDarkMode
                      ? "rgb(13, 17, 23)"
                      : "rgb(255, 255, 255)"
                    : baseTheme.foreground,
              }}
            >
              {snippetName}
            </button>
          ))}
        </div>
      )}

      {/* Main Content */}
      <main className="grid grid-cols-1 lg:grid-cols-2 h-[calc(100vh-81px)] js-compiler-mobile-stack">
        {/* Code Editor Panel */}
        <div
          className="flex flex-col border-r js-compiler-mobile-border"
          style={{ borderColor: baseTheme.border }}
        >
          <div
            className="px-6 py-4 border-b flex items-center justify-between"
            style={{
              backgroundColor: baseTheme.card,
              borderColor: baseTheme.border,
            }}
          >
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path d="M4.72 3.22a.75.75 0 011.06 1.06L2.06 8l3.72 3.72a.75.75 0 11-1.06 1.06L.47 8.53a.75.75 0 010-1.06l4.25-4.25zm6.56 0a.75.75 0 10-1.06 1.06L13.94 8l-3.72 3.72a.75.75 0 101.06 1.06l4.25-4.25a.75.75 0 000-1.06L11.28 3.22z"></path>
              </svg>
              Code Editor
            </h2>
            <button
              disabled={isRunning}
              onClick={runCode}
              className="px-4 py-2 rounded-md text-white text-sm font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
              style={{
                backgroundColor: isDarkMode
                  ? "rgb(26, 127, 55)"
                  : "rgb(31, 136, 61)",
              }}
            >
              {isRunning ? (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M8 0a8 8 0 100 16A8 8 0 008 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z"></path>
                  </svg>
                  Running...
                </>
              ) : (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M8 0a8 8 0 100 16A8 8 0 008 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0zm4.879-2.773l4.264 2.559a.25.25 0 010 .428l-4.264 2.559A.25.25 0 016 10.559V5.442a.25.25 0 01.379-.215z"></path>
                  </svg>
                  Run Code
                </>
              )}
            </button>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Write your JavaScript code here..."
            className="flex-1 p-6 border-0 outline-0 resize-none js-compiler-textarea js-compiler-scroll"
            style={{
              backgroundColor: baseTheme.background,
              color: baseTheme.foreground,
              tabSize: 2,
            }}
            spellCheck={false}
          />
        </div>

        {/* Output Panel */}
        <div className="flex flex-col">
          <div
            className="px-6 py-4 border-b flex items-center justify-between"
            style={{
              backgroundColor: baseTheme.card,
              borderColor: baseTheme.border,
            }}
          >
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path d="M0 2.75C0 1.784.784 1 1.75 1h12.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0114.25 15H1.75A1.75 1.75 0 010 13.25V2.75zm1.75-.25a.25.25 0 00-.25.25v10.5c0 .138.112.25.25.25h12.5a.25.25 0 00.25-.25V2.75a.25.25 0 00-.25-.25H1.75zM7.25 8a.75.75 0 01-.22.53L4.78 10.78a.75.75 0 01-1.06-1.06L5.44 8 3.72 6.28a.75.75 0 011.06-1.06L7.03 7.47c.141.14.22.331.22.53zm2.5 2.25a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" />
              </svg>
              Console Output
            </h2>
            <button
              onClick={clearOutput}
              className="px-3 py-1 text-sm border rounded transition-all duration-200"
              style={{
                backgroundColor: "transparent",
                borderColor: baseTheme.cardBorder,
                color: isDarkMode ? "rgb(139, 148, 158)" : "rgb(87, 96, 106)",
              }}
            >
              Clear
            </button>
          </div>

          <div
            className="flex-1 p-6 overflow-y-auto js-compiler-output js-compiler-scroll"
            style={{ backgroundColor: baseTheme.background }}
          >
            {output.length === 0 ? (
              <div className="flex items-center justify-center h-full flex-col gap-4 opacity-60">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="opacity-40"
                >
                  <path d="M0 2.75C0 1.784.784 1 1.75 1h12.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0114.25 15H1.75A1.75 1.75 0 010 13.25V2.75zm1.75-.25a.25.25 0 00-.25.25v10.5c0 .138.112.25.25.25h12.5a.25.25 0 00.25-.25V2.75a.25.25 0 00-.25-.25H1.75zM7.25 8a.75.75 0 01-.22.53L4.78 10.78a.75.75 0 01-1.06-1.06L5.44 8 3.72 6.28a.75.75 0 011.06-1.06L7.03 7.47c.141.14.22.331.22.53zm2.5 2.25a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" />
                </svg>
                <p className="text-base m-0">
                  Run your code to see output here
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {output.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 rounded border-l-4 text-sm"
                    style={{
                      backgroundColor:
                        item.type === "error"
                          ? isDarkMode
                            ? "rgba(248, 81, 73, 0.1)"
                            : "rgba(248, 81, 73, 0.05)"
                          : item.type === "warn"
                            ? isDarkMode
                              ? "rgba(255, 212, 59, 0.1)"
                              : "rgba(255, 212, 59, 0.05)"
                            : isDarkMode
                              ? "rgba(121, 192, 255, 0.1)"
                              : "rgba(121, 192, 255, 0.05)",
                      borderLeftColor:
                        item.type === "error"
                          ? "rgb(248, 81, 73)"
                          : item.type === "warn"
                            ? "rgb(255, 212, 59)"
                            : "rgb(121, 192, 255)",
                      color:
                        item.type === "error"
                          ? "rgb(248, 81, 73)"
                          : item.type === "warn"
                            ? "rgb(255, 212, 59)"
                            : baseTheme.foreground,
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <span className="opacity-60 text-xs min-w-[60px]">
                        {item.timestamp}
                      </span>
                      <pre className="m-0 whitespace-pre-wrap break-words">
                        {item.content}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
