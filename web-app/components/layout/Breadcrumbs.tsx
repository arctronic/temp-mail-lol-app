import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <nav aria-label="breadcrumb" className="mb-4">
      <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
        <li>
          <Link to="/" className="hover:text-primary transition-colors">
            Home
          </Link>
        </li>
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          const name = value.charAt(0).toUpperCase() + value.slice(1);

          return (
            <li key={to} className="flex items-center">
              <ChevronRight className="h-4 w-4 mx-2" />
              {last ? (
                <span className={cn("text-foreground", last && "font-medium")}>
                  {name}
                </span>
              ) : (
                <Link
                  to={to}
                  className={cn(
                    "hover:text-primary transition-colors",
                    last && "text-foreground font-medium"
                  )}
                >
                  {name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}; 