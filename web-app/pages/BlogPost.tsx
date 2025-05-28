import { Mermaid } from "@/components/Mermaid";
import { StructuredData } from "@/components/StructuredData";
import blogPosts from "@/data/blog-posts.json";
import { format } from "date-fns";
import { Helmet } from "react-helmet";
import ReactMarkdown from "react-markdown";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  publishedDate: string;
  content: string;
  featuredImage?: string;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}

interface CodeProps {
  node?: unknown;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
}

const BlogPost = () => {
  const params = useParams();
  const postId = params.id;
  const location = useLocation();
  
  console.log('BlogPost - Location:', location);
  console.log('BlogPost - Params:', params);
  console.log('BlogPost - postId:', postId);
  console.log('BlogPost - Available posts:', blogPosts.posts.map(p => p.id));
  
  const post = blogPosts.posts.find((p) => p.id === postId);
  console.log('BlogPost - Found post:', post);

  if (!post) {
    console.log('BlogPost - Post not found, redirecting to /blog');
    return <Navigate to="/blog" replace />;
  }

  return (
    <>
      <Helmet>
        <title>{post.title}</title>
        <meta name="description" content={post.seo.description || `${post.title} - Blog Post`} />
        <meta name="keywords" content={Array.isArray(post.seo.keywords) ? post.seo.keywords.join(', ') : post.seo.keywords} />
      </Helmet>
      <StructuredData
        type="article"
        data={{
          headline: post.title,
          description: post.seo.description || post.excerpt,
          image: post.featuredImage,
          datePublished: post.publishedDate,
          dateModified: post.publishedDate,
          author: {
            name: post.author,
            url: window.location.origin
          },
          publisher: {
            name: "temp-mail.lol",
            logo: {
              url: `${window.location.origin}/assets/images/temp-mail-icon-removebg.png`
            }
          }
        }}
      />

      <article className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>{post.author}</span>
            <span>•</span>
            <time dateTime={post.publishedDate}>
              {format(new Date(post.publishedDate), 'MMMM d, yyyy')}
            </time>
          </div>
        </header>

        {post.featuredImage && (
          <div className="relative aspect-video mb-8 rounded-lg overflow-hidden bg-muted">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="object-cover w-full h-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement?.classList.add('hidden');
              }}
            />
          </div>
        )}

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeSlug, rehypeAutolinkHeadings]}
            components={{
              code: ({ node, className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || '');
                const isInline = !className;
                if (!isInline && match) {
                  if (match[1] === 'mermaid') {
                    return <Mermaid chart={String(children).replace(/\n$/, '')} />;
                  }
                  return (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  );
                }
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
              img: ({ node, ...props }) => (
                <img
                  className="rounded-lg my-4"
                  loading="lazy"
                  {...props}
                />
              ),
              a: ({ node, ...props }) => (
                <a
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                  {...props}
                />
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote
                  className="border-l-4 border-primary pl-4 italic my-4"
                  {...props}
                />
              ),
              h1: ({ node, ...props }) => (
                <h1 className="text-4xl font-bold mt-8 mb-4" {...props} />
              ),
              h2: ({ node, ...props }) => (
                <h2 className="text-3xl font-bold mt-8 mb-4" {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 className="text-2xl font-bold mt-6 mb-3" {...props} />
              ),
              h4: ({ node, ...props }) => (
                <h4 className="text-xl font-bold mt-4 mb-2" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul className="list-disc pl-6 my-4 space-y-2" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal pl-6 my-4 space-y-2" {...props} />
              ),
              li: ({ node, ...props }) => (
                <li className="my-1" {...props} />
              ),
              p: ({ node, ...props }) => (
                <p className="my-4 leading-relaxed" {...props} />
              ),
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto my-4">
                  <table className="min-w-full border-collapse" {...props} />
                </div>
              ),
              th: ({ node, ...props }) => (
                <th className="border border-border px-4 py-2 text-left" {...props} />
              ),
              td: ({ node, ...props }) => (
                <td className="border border-border px-4 py-2" {...props} />
              ),
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </article>
    </>
  );
};

export default BlogPost; 