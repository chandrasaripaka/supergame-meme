import React from "react";
import { Message } from "@/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex items-start ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <div className="flex-shrink-0 mr-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
      )}

      <div
        className={`chat-message ${isUser ? "bg-primary text-white" : "bg-light text-gray-800"} rounded-lg p-3 shadow-sm`}
      >
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <div className="prose max-w-none dark:prose-invert prose-sm">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({ node, ...props }: any) => {
                  // Apply gradient styling to all day headings with better indentation
                  return (
                    <h2
                      className="text-xl font-bold mt-8 mb-4 pl-2 flex items-center bg-gradient-to-r from-primary to-purple-600 text-transparent bg-clip-text border-l-4 border-primary py-1"
                      {...props}
                    />
                  );
                },
                h3: ({ node, ...props }) => (
                  <h3
                    className="text-lg font-semibold mt-6 mb-3 pl-2 text-primary-dark border-l-2 border-primary-light py-1"
                    {...props}
                  />
                ),
                li: ({ node, ...props }: any) => (
                  <li className="mb-3 flex items-start pl-2" {...props} />
                ),
                p: ({ node, ...props }) => <p className="mb-2" {...props} />,
                code: ({ node, className, ...props }: any) => {
                  const match = /language-(\w+)/.exec(className || "");
                  const isInline =
                    !match &&
                    typeof props.children === "string" &&
                    !props.children.includes("\n");

                  // Check if this is a budget breakdown code block
                  if (typeof props.children === "string") {
                    const content = props.children;

                    // Check for budget breakdown
                    const isBudgetBreakdown =
                      content.includes("Estimated Breakdown") ||
                      content.includes("Accommodation:") ||
                      content.includes("Transportation:") ||
                      content.includes("Total:");

                    if (isBudgetBreakdown) {
                      // Special styling for budget breakdown
                      return (
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4 shadow-sm">
                          <h4 className="text-blue-800 font-semibold mb-2 flex items-center">
                            <span className="mr-2">💰</span>
                            Budget Breakdown
                          </h4>
                          <pre className="whitespace-pre-wrap text-sm font-mono text-white-700 pl-2 border-l-2 border-blue-200">
                            {content}
                          </pre>
                        </div>
                      );
                    }

                    // Check for weather information
                    const isWeatherInfo =
                      content.includes("Weather Forecast") ||
                      (content.includes("Temperature") &&
                        (content.includes("Conditions") ||
                          content.includes("Humidity")));

                    if (isWeatherInfo) {
                      // Special styling for weather information
                      const tempMatch =
                        content.match(/Temperature:\s*([\d.-]+)°C/i) ||
                        content.match(/(\d+)°C/);
                      const conditionMatch =
                        content.match(/Conditions?:\s*([A-Za-z\s]+)/i) ||
                        content.match(
                          /conditions?(?:\s*is|\s*are)?:\s*([A-Za-z\s]+)/i,
                        );

                      // Determine weather icon
                      let weatherIcon = (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 text-blue-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                          />
                        </svg>
                      );

                      if (conditionMatch) {
                        const condition = conditionMatch[1]
                          .toLowerCase()
                          .trim();
                        if (
                          condition.includes("sunny") ||
                          condition.includes("clear")
                        ) {
                          weatherIcon = (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-8 w-8 text-yellow-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                              />
                            </svg>
                          );
                        } else if (
                          condition.includes("rain") ||
                          condition.includes("shower")
                        ) {
                          weatherIcon = (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-8 w-8 text-blue-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 14l-7 7m0 0l-7-7m7 7V3"
                              />
                            </svg>
                          );
                        } else if (condition.includes("cloud")) {
                          weatherIcon = (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-8 w-8 text-gray-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                              />
                            </svg>
                          );
                        }
                      }

                      return (
                        <div className="bg-gradient-to-br from-blue-100/90 to-sky-100/90 border border-blue-200 rounded-lg p-5 mb-4 shadow-md">
                          <h4 className="text-blue-800 font-semibold mb-4 flex items-center bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent">
                            <span className="mr-2 text-xl">🌤️</span>
                            Weather Information
                          </h4>
                          <div className="flex items-center mb-3 bg-white/70 backdrop-blur-sm p-3 rounded-md border border-blue-200/50">
                            <div className="mr-4 p-2 bg-gradient-to-br from-blue-500/10 to-sky-500/10 rounded-full">
                              {weatherIcon}
                            </div>
                            <div>
                              {tempMatch && (
                                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent">
                                  {tempMatch[1]}°C
                                </div>
                              )}
                              {conditionMatch && (
                                <div className="text-blue-700 font-medium">
                                  {conditionMatch[1]}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="mt-3 bg-white/80 backdrop-blur-sm rounded-md p-3">
                            <h5 className="font-semibold text-blue-800 mb-2 flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              Forecast Details:
                            </h5>
                            <div className="space-y-3">
                              {content
                                .split("\n\n")
                                .map((section: string, index: number) => {
                                  if (
                                    section.includes("Day 1:") ||
                                    section.includes("Day 2:") ||
                                    section.includes("Day 3:")
                                  ) {
                                    const dayMatch =
                                      section.match(/Day (\d+):/);
                                    const dayNum = dayMatch
                                      ? parseInt(dayMatch[1])
                                      : 1;

                                    let bgColor =
                                      "from-blue-500/5 to-blue-400/5";
                                    let borderColor = "border-blue-300";

                                    if (dayNum === 2) {
                                      bgColor =
                                        "from-green-500/5 to-green-400/5";
                                      borderColor = "border-green-300";
                                    } else if (dayNum === 3) {
                                      bgColor =
                                        "from-purple-500/5 to-purple-400/5";
                                      borderColor = "border-purple-300";
                                    }

                                    return (
                                      <div
                                        key={index}
                                        className={`bg-gradient-to-r ${bgColor} p-2 rounded-md border ${borderColor}`}
                                      >
                                        <pre className="whitespace-pre-wrap text-sm font-medium text-white-800">
                                          {section}
                                        </pre>
                                      </div>
                                    );
                                  }

                                  return (
                                    <pre
                                      key={index}
                                      className="whitespace-pre-wrap text-sm font-medium text-gray-800 pl-2 border-l-3 border-blue-400 pt-2 pb-1"
                                    >
                                      {section}
                                    </pre>
                                  );
                                })}
                            </div>
                          </div>
                        </div>
                      );
                    }
                  }

                  return isInline ? (
                    <code
                      className="bg-gray-100 rounded p-1 text-sm text-gray-800"
                      {...props}
                    />
                  ) : (
                    <div className="bg-white border border-gray-200 rounded-md p-4 text-sm font-mono text-gray-800 overflow-x-auto my-3">
                      <code {...props} />
                    </div>
                  );
                },
                em: ({ node, ...props }) => (
                  <em
                    className="text-primary dark:text-primary-dark"
                    {...props}
                  />
                ),
                strong: ({ node, ...props }) => (
                  <strong className="font-bold text-primary-dark" {...props} />
                ),
                table: ({ node, ...props }) => (
                  <div className="overflow-x-auto my-4 rounded-md border border-gray-200">
                    <table
                      className="min-w-full divide-y divide-gray-200"
                      {...props}
                    />
                  </div>
                ),
                thead: ({ node, ...props }) => (
                  <thead className="bg-gray-50" {...props} />
                ),
                tbody: ({ node, ...props }) => (
                  <tbody
                    className="bg-white divide-y divide-gray-200"
                    {...props}
                  />
                ),
                tr: ({ node, ...props }) => (
                  <tr className="hover:bg-gray-50" {...props} />
                ),
                th: ({ node, ...props }) => (
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    {...props}
                  />
                ),
                td: ({ node, ...props }) => (
                  <td
                    className="px-4 py-2 whitespace-nowrap text-sm"
                    {...props}
                  />
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 ml-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex items-start">
      <div className="flex-shrink-0 mr-3">
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>
      <div className="chat-message bg-light rounded-lg p-3 shadow-sm">
        <div className="typing-indicator flex space-x-1">
          <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
          <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
          <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
        </div>
      </div>
    </div>
  );
}
