import ReactMarkdown, { type ExtraProps } from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import {
  vscDarkPlus,
} from "react-syntax-highlighter/dist/esm/styles/prism"
import remarkGfm from "remark-gfm"
import { ScrollArea, ScrollBar } from "./ui/scroll-area"
import { Label } from "./ui/label"

export default function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code(props) {
          return <CodeBlock props={props} />
        },
        ol(props) {
          return <ol className="list-decimal pl-4" {...props} />
        },
        ul(props) {
          return <ul className="list-disc pl-5 my-3" {...props} />
        },
        li(props) {
          return <li className="pl-1.5 my-2" {...props} />
        },
        p(props) {
          return <p className="my-5 text-justify" {...props} />
        },
        hr(props) {
          return <hr className="my-2" {...props} />
        },
      }}
    >
      {children}
    </ReactMarkdown>
  )
}

export function CodeBlock({
  props,
}: {
  props: React.ClassAttributes<HTMLElement> &
  React.HTMLAttributes<HTMLElement> &
  ExtraProps
}) {
  const { className, ref, ...rest } = props
  const match = /language-(\w+)/.exec(className || "")
  return match ? (
    <div className="relative group rounded-md mt-2">
      <div className="w-full bg-accent p-3 rounded-t-md">
        <Label>{match[1]}</Label>
      </div>
      <ScrollArea className="relative rounded-b-md">
        <SyntaxHighlighter
          {...rest}

          PreTag="div"
          language={match[1]}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: "1rem",
            fontSize: "0.875rem",
            // borderRadius: "0 .25rem",
          }}
        >
          {props.children as string}
        </SyntaxHighlighter>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  ) : (
    <code {...rest} className="bg-accent px-1.5 mx-0.5 py-1 rounded-sm">
      {props.children}
    </code>
  )
}
