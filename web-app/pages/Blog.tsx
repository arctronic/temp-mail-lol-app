import { Link } from "react-router-dom";
import blogPosts from "@/data/blog-posts.json";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Helmet } from "react-helmet";

const Blog = () => {
  console.log('Blog - Available posts:', blogPosts.posts.map(p => ({ id: p.id, title: p.title })));

  return (
    <>
      <Helmet>
        <title>Blog - Temp-mail.lol</title>
        <meta name="description" content="Read our latest articles about temporary email services, online privacy, and digital security." />
      </Helmet>
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-4xl font-bold mb-8">Blog</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.posts.map((post) => {
            console.log('Blog - Generating link for post:', post.id);
            return (
              <Link 
                key={post.id}
                to={`/blog/${post.id}`}
                className="group"
              >
                <Card className="h-full transition-all duration-200 hover:shadow-lg flex flex-col">
                  <CardHeader className="flex-grow">
                    {post.featuredImage && (
                      <div className="aspect-video relative overflow-hidden rounded-lg mb-4">
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {post.title}
                    </CardTitle>
                    <CardDescription>
                      By {post.author} • {formatDate(post.publishedDate)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground line-clamp-3">
                      {post.excerpt}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <span className="text-sm text-primary font-medium group-hover:underline">
                      Read more →
                    </span>
                  </CardFooter>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Blog; 