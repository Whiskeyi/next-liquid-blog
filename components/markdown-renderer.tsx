import { MarkdownAsync } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import { CodeBlock } from "@/components/code-block";
import { ImageWithZoom } from "@/components/image-with-zoom";
import { normalizeAssetPath } from "@/lib/posts";

type MarkdownRendererProps = {
  content: string;
};

const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "img", "figure", "figcaption"],
  attributes: {
    ...defaultSchema.attributes,
    "*": [...(defaultSchema.attributes?.["*"] ?? []), "className", "id"],
    a: [...(defaultSchema.attributes?.a ?? []), "target", "rel"],
    code: [...(defaultSchema.attributes?.code ?? []), "data-language", "data-theme"],
    pre: [...(defaultSchema.attributes?.pre ?? []), "data-language", "data-theme"],
    img: ["src", "alt", "title", "width", "height", "loading", "decoding", "data-src"]
  }
};

export async function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown-body">
      <MarkdownAsync
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeRaw,
          [rehypeSanitize, sanitizeSchema],
          rehypeSlug,
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
                value: "#"
              }
            }
          ],
          [
            rehypePrettyCode,
            {
              theme: "github-dark-dimmed",
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
            return <ImageWithZoom src={normalizeAssetPath(imageSrc)} alt={alt ?? ""} {...props} />;
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
