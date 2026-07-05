import { MarkdownAsync } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { CodeBlock } from "@/components/code-block";
import { ImageWithZoom } from "@/components/image-with-zoom";
import { createHeadingIdRegistry } from "@/lib/heading-ids";
import { normalizeAssetPath } from "@/lib/posts";

type MarkdownRendererProps = {
  content: string;
  slug: string;
};

const ALLOWED_EXTRA_TAG_NAMES = ["img", "figure", "figcaption"];
const ALLOWED_GLOBAL_ATTRIBUTES = ["className", "id"];
const ALLOWED_LINK_ATTRIBUTES = ["target", "rel"];
const ALLOWED_CODE_ATTRIBUTES = ["data-language", "data-theme"];
const ALLOWED_IMAGE_ATTRIBUTES = ["src", "alt", "title", "width", "height", "loading", "decoding", "data-src"];
const HEADING_TAG_PATTERN = /^h[1-6]$/;
const HEADING_ANCHOR_MARK = "#";
const PRETTY_CODE_THEME = "github-dark-dimmed";
const FALLBACK_STRONG_TEXT_PATTERN = /\*\*([^*\n]+?)\*\*/g;

const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), ...ALLOWED_EXTRA_TAG_NAMES],
  attributes: {
    ...defaultSchema.attributes,
    "*": [...(defaultSchema.attributes?.["*"] ?? []), ...ALLOWED_GLOBAL_ATTRIBUTES],
    a: [...(defaultSchema.attributes?.a ?? []), ...ALLOWED_LINK_ATTRIBUTES],
    code: [...(defaultSchema.attributes?.code ?? []), ...ALLOWED_CODE_ATTRIBUTES],
    pre: [...(defaultSchema.attributes?.pre ?? []), ...ALLOWED_CODE_ATTRIBUTES],
    img: ALLOWED_IMAGE_ATTRIBUTES
  }
};

type HastNode = {
  type?: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

type MarkdownNode = {
  type?: string;
  value?: string;
  children?: MarkdownNode[];
};

function getTextContent(node: HastNode): string {
  if (node.type === "text") return node.value ?? "";
  return node.children?.map(getTextContent).join("") ?? "";
}

function visitNodes(node: HastNode, visitor: (node: HastNode) => void) {
  visitor(node);
  node.children?.forEach((child) => visitNodes(child, visitor));
}

function rehypeHeadingIds() {
  return (tree: HastNode) => {
    const idRegistry = createHeadingIdRegistry();

    visitNodes(tree, (node) => {
      if (!HEADING_TAG_PATTERN.test(node.tagName ?? "")) return;

      node.properties = {
        ...node.properties,
        id: idRegistry.getId(getTextContent(node))
      };
    });
  };
}

function textNode(value: string): MarkdownNode {
  return { type: "text", value };
}

function splitFallbackStrongText(value: string): MarkdownNode[] {
  FALLBACK_STRONG_TEXT_PATTERN.lastIndex = 0;

  const nodes: MarkdownNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = FALLBACK_STRONG_TEXT_PATTERN.exec(value))) {
    const [rawMatch, rawStrongText] = match;
    const strongText = rawStrongText.trim();

    if (!strongText) continue;
    if (match.index > lastIndex) nodes.push(textNode(value.slice(lastIndex, match.index)));

    const leadingSpaceLength = rawStrongText.length - rawStrongText.trimStart().length;
    const trailingSpaceLength = rawStrongText.length - rawStrongText.trimEnd().length;
    const leadingSpace = rawStrongText.slice(0, leadingSpaceLength);
    const trailingSpace = trailingSpaceLength ? rawStrongText.slice(rawStrongText.length - trailingSpaceLength) : "";

    if (leadingSpace) nodes.push(textNode(leadingSpace));
    nodes.push({
      type: "strong",
      children: [textNode(strongText)]
    });
    if (trailingSpace) nodes.push(textNode(trailingSpace));

    lastIndex = match.index + rawMatch.length;
  }

  if (!nodes.length) return [textNode(value)];
  if (lastIndex < value.length) nodes.push(textNode(value.slice(lastIndex)));

  return nodes;
}

function transformFallbackStrongText(node: MarkdownNode) {
  if (node.type === "code" || node.type === "inlineCode" || !node.children) return;

  node.children = node.children.flatMap((child) => {
    if (child.type === "text" && child.value) return splitFallbackStrongText(child.value);

    transformFallbackStrongText(child);
    return [child];
  });
}

function remarkFallbackStrongText() {
  return (tree: MarkdownNode) => {
    transformFallbackStrongText(tree);
  };
}

export async function MarkdownRenderer({ content, slug }: MarkdownRendererProps) {
  return (
    <div className="markdown-body">
      <MarkdownAsync
        remarkPlugins={[remarkGfm, remarkFallbackStrongText]}
        rehypePlugins={[
          rehypeRaw,
          [rehypeSanitize, sanitizeSchema],
          rehypeHeadingIds,
          [
            rehypeAutolinkHeadings,
            {
              behavior: "append",
              properties: {
                className: ["heading-anchor"],
                ariaLabel: "复制标题链接"
              },
              content: {
                type: "text",
                value: HEADING_ANCHOR_MARK
              }
            }
          ],
          [
            rehypePrettyCode,
            {
              theme: PRETTY_CODE_THEME,
              keepBackground: false
            }
          ]
        ]}
        components={{
          a({ href = "", children, ...props }) {
            const external = href.startsWith("http://") || href.startsWith("https://");
            return (
              <a
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer" : undefined}
                {...props}
              >
                {children}
              </a>
            );
          },
          img({ src, alt, node, ...props }) {
            const dataSrc = node?.properties?.dataSrc ?? node?.properties?.["data-src"];
            const imageSrc = typeof src === "string" ? src : typeof dataSrc === "string" ? dataSrc : "";
            return <ImageWithZoom src={normalizeAssetPath(imageSrc, slug)} alt={alt ?? ""} {...props} />;
          },
          pre({ children, ...props }) {
            return <CodeBlock {...props}>{children}</CodeBlock>;
          }
        }}
      >
        {content}
      </MarkdownAsync>
    </div>
  );
}
