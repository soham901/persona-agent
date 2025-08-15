"use client";

import { CodeBlock, CodeBlockCopyButton } from "./code-block";
import type { ComponentProps, HTMLAttributes } from "react";
import { memo, isValidElement } from "react";
import ReactMarkdown, { type Options } from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { cn } from "@/lib/utils";
import "katex/dist/katex.min.css";
import hardenReactMarkdown from "harden-react-markdown";

function parseIncompleteMarkdown(text: string): string {
  if (!text || typeof text !== "string") {
    return text;
  }

  let result = text;

  result = result.replace(
    /^(?:\s*)(?:Hitesh\s+Choudhary\s*:\s*|Piyush\s+Garg\s*:\s*|Summary\s*:\s*)/i,
    "",
  );

  const linkImagePattern = /(!?\[)([^\]]*?)$/;
  const linkMatch = result.match(linkImagePattern);
  if (linkMatch) {
    const startIndex = result.lastIndexOf(linkMatch[1]);
    result = result.substring(0, startIndex);
  }

  const boldPattern = /(\*\*)([^*]*?)$/;
  const boldMatch = result.match(boldPattern);
  if (boldMatch) {
    const asteriskPairs = (result.match(/\*\*/g) || []).length;
    if (asteriskPairs % 2 === 1) {
      result = `${result}**`;
    }
  }

  const italicPattern = /(__)([^_]*?)$/;
  const italicMatch = result.match(italicPattern);
  if (italicMatch) {
    const underscorePairs = (result.match(/__/g) || []).length;
    if (underscorePairs % 2 === 1) {
      result = `${result}__`;
    }
  }

  const singleAsteriskPattern = /(\*)([^*]*?)$/;
  const singleAsteriskMatch = result.match(singleAsteriskPattern);
  if (singleAsteriskMatch) {
    const singleAsterisks = result.split("").reduce((acc, char, index) => {
      if (char === "*") {
        const prevChar = result[index - 1];
        const nextChar = result[index + 1];
        if (prevChar !== "*" && nextChar !== "*") {
          return acc + 1;
        }
      }
      return acc;
    }, 0);

    if (singleAsterisks % 2 === 1) {
      result = `${result}*`;
    }
  }

  const singleUnderscorePattern = /(_)([^_]*?)$/;
  const singleUnderscoreMatch = result.match(singleUnderscorePattern);
  if (singleUnderscoreMatch) {
    const singleUnderscores = result.split("").reduce((acc, char, index) => {
      if (char === "_") {
        const prevChar = result[index - 1];
        const nextChar = result[index + 1];
        if (prevChar !== "_" && nextChar !== "_") {
          return acc + 1;
        }
      }
      return acc;
    }, 0);

    if (singleUnderscores % 2 === 1) {
      result = `${result}_`;
    }
  }

  const inlineCodePattern = /(`)([^`]*?)$/;
  const inlineCodeMatch = result.match(inlineCodePattern);
  if (inlineCodeMatch) {
    const allTripleBackticks = (result.match(/```/g) || []).length;
    const insideIncompleteCodeBlock = allTripleBackticks % 2 === 1;

    if (!insideIncompleteCodeBlock) {
      let singleBacktickCount = 0;
      for (let i = 0; i < result.length; i++) {
        if (result[i] === "`") {
          const isTripleStart = result.substring(i, i + 3) === "```";
          const isTripleMiddle =
            i > 0 && result.substring(i - 1, i + 2) === "```";
          const isTripleEnd = i > 1 && result.substring(i - 2, i + 1) === "```";

          if (!isTripleStart && !isTripleMiddle && !isTripleEnd) {
            singleBacktickCount++;
          }
        }
      }

      if (singleBacktickCount % 2 === 1) {
        result = `${result}\``;
      }
    }
  }

  const strikethroughPattern = /(~~)([^~]*?)$/;
  const strikethroughMatch = result.match(strikethroughPattern);
  if (strikethroughMatch) {
    const tildePairs = (result.match(/~~/g) || []).length;
    if (tildePairs % 2 === 1) {
      result = `${result}~~`;
    }
  }

  return result;
}

const HardenedMarkdown = hardenReactMarkdown(ReactMarkdown);

export type ResponseProps = HTMLAttributes<HTMLDivElement> & {
  options?: Options;
  children: Options["children"];
  allowedImagePrefixes?: ComponentProps<
    ReturnType<typeof hardenReactMarkdown>
  >["allowedImagePrefixes"];
  allowedLinkPrefixes?: ComponentProps<
    ReturnType<typeof hardenReactMarkdown>
  >["allowedLinkPrefixes"];
  defaultOrigin?: ComponentProps<
    ReturnType<typeof hardenReactMarkdown>
  >["defaultOrigin"];
  parseIncompleteMarkdown?: boolean;
};

const components: Options["components"] = {
  ol: ({ children, className, ...props }) => (
    <ol
      className={cn("ml-4 list-outside list-decimal space-y-0.25", className)}
      {...props}
    >
      {children}
    </ol>
  ),
  li: ({ children, className, ...props }) => (
    <li className={cn("py-0.125", className)} {...props}>
      {children}
    </li>
  ),
  ul: ({ children, className, ...props }) => (
    <ul
      className={cn("ml-4 list-outside list-disc space-y-0.25", className)}
      {...props}
    >
      {children}
    </ul>
  ),
  strong: ({ children, className, ...props }) => (
    <span className={cn("font-semibold", className)} {...props}>
      {children}
    </span>
  ),
  a: ({ children, className, ...props }) => (
    <a
      className={cn("font-medium text-primary underline", className)}
      rel="noreferrer"
      target="_blank"
      {...props}
    >
      {children}
    </a>
  ),
  h1: ({ children, className, ...props }) => (
    <h1
      className={cn("mt-1.5 mb-0.25 font-semibold text-lg", className)}
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, className, ...props }) => (
    <h2
      className={cn("mt-1.5 mb-0.25 font-semibold text-base", className)}
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, className, ...props }) => (
    <h3
      className={cn("mt-1.5 mb-0.25 font-semibold text-sm", className)}
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ children, className, ...props }) => (
    <h4
      className={cn("mt-1.5 mb-0.25 font-semibold text-xs", className)}
      {...props}
    >
      {children}
    </h4>
  ),
  h5: ({ children, className, ...props }) => (
    <h5
      className={cn("mt-1.5 mb-0.25 font-semibold text-xs", className)}
      {...props}
    >
      {children}
    </h5>
  ),
  h6: ({ children, className, ...props }) => (
    <h6
      className={cn("mt-1.5 mb-0.25 font-semibold text-xs", className)}
      {...props}
    >
      {children}
    </h6>
  ),
  table: ({ children, className, ...props }) => (
    <div className="my-1.5 overflow-x-auto">
      <table
        className={cn("w-full border-collapse border border-border", className)}
        {...props}
      >
        {children}
      </table>
    </div>
  ),
  thead: ({ children, className, ...props }) => (
    <thead className={cn("bg-muted/50", className)} {...props}>
      {children}
    </thead>
  ),
  tbody: ({ children, className, ...props }) => (
    <tbody className={cn("divide-y divide-border", className)} {...props}>
      {children}
    </tbody>
  ),
  tr: ({ children, className, ...props }) => (
    <tr className={cn("border-b border-border", className)} {...props}>
      {children}
    </tr>
  ),
  th: ({ children, className, ...props }) => (
    <th
      className={cn("px-1.5 py-0.5 text-left font-semibold text-xs", className)}
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, className, ...props }) => (
    <td className={cn("px-1.5 py-0.5 text-xs", className)} {...props}>
      {children}
    </td>
  ),
  blockquote: ({ children, className, ...props }) => (
    <blockquote
      className={cn(
        "my-1.5 border-l-2 border-muted-foreground/30 pl-1.5 italic text-muted-foreground text-xs",
        className,
      )}
      {...props}
    >
      {children}
    </blockquote>
  ),
  code: ({ className, ...props }) => {
    const inline =
      props.node?.position?.start.line === props.node?.position?.end.line;

    if (!inline) {
      return <code className={className} {...props} />;
    }

    return (
      <code
        className={cn(
          "rounded bg-muted px-0.25 py-0.125 font-mono text-xs",
          className,
        )}
        {...props}
      />
    );
  },
  pre: (rawProps) => {
    type UnknownPreProps = React.ComponentPropsWithoutRef<"pre"> & {
      children?: React.ReactNode;
      className?: string;
    };
    const { className, children } = rawProps as UnknownPreProps;
    let language = "javascript";

    const nodeElement = rawProps.node as
      | { properties?: { className?: string } }
      | undefined;
    if (typeof nodeElement?.properties?.className === "string") {
      language = nodeElement.properties.className.replace("language-", "");
    }

    let code = "" as string;
    try {
      if (
        isValidElement(children) &&
        (children as React.ReactElement).props &&
        typeof (
          (children as React.ReactElement).props as { children?: unknown }
        ).children === "string"
      ) {
        code =
          (((children as React.ReactElement).props as { children?: unknown })
            .children as string) ?? "";
      } else if (typeof children === "string") {
        code = children as string;
      }
    } catch {
      // ignore – fallback to empty code block
    }

    return (
      <CodeBlock
        className={cn("my-1.5 h-auto", className)}
        code={code}
        language={language}
      >
        <CodeBlockCopyButton
          onCopy={() => console.log("Copied code to clipboard")}
          onError={() => console.error("Failed to copy code to clipboard")}
        />
      </CodeBlock>
    );
  },
};

export const Response = memo(
  ({
    className,
    options,
    children,
    allowedImagePrefixes,
    allowedLinkPrefixes,
    defaultOrigin,
    parseIncompleteMarkdown: shouldParseIncompleteMarkdown = true,
    ...props
  }: ResponseProps) => {
    const parsedChildren =
      typeof children === "string" && shouldParseIncompleteMarkdown
        ? parseIncompleteMarkdown(children)
        : children;

    return (
      <div
        className={cn(
          "size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
          className,
        )}
        {...props}
      >
        <HardenedMarkdown
          components={components}
          rehypePlugins={[rehypeKatex]}
          remarkPlugins={[remarkGfm, remarkMath]}
          allowedImagePrefixes={allowedImagePrefixes ?? ["*"]}
          allowedLinkPrefixes={allowedLinkPrefixes ?? ["*"]}
          defaultOrigin={defaultOrigin}
          {...options}
        >
          {parsedChildren}
        </HardenedMarkdown>
      </div>
    );
  },
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);

Response.displayName = "Response";
