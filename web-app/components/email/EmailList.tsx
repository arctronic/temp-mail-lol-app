import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, RefreshCw, ChevronUp, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import type { MongoDate } from "@/types/mongo";
import type { Email } from "@/contexts/EmailContext";
import { useState, useMemo } from "react";

interface EmailListProps {
  emails: Email[];
  isLoading: boolean;
  onViewEmail: (email: Email) => void;
}

const ITEMS_PER_PAGE = 10;

const formatDate = (date: MongoDate | string) => {
  const dateObj = new Date(typeof date === 'object' && '$date' in date ? date.$date : date);
  return format(dateObj, 'MMM d, h:mm a');
};

export const EmailList = ({ emails, isLoading, onViewEmail }: EmailListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Sort emails by date
  const sortedEmails = useMemo(() => {
    return [...emails].sort((a, b) => {
      const dateA = new Date(typeof a.date === 'object' && '$date' in a.date ? a.date.$date : a.date);
      const dateB = new Date(typeof b.date === 'object' && '$date' in b.date ? b.date.$date : b.date);
      return sortDirection === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    });
  }, [emails, sortDirection]);

  // Calculate pagination
  const totalPages = Math.ceil(sortedEmails.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedEmails = sortedEmails.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="w-full overflow-x-auto space-y-4" role="region" aria-label="Email list">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[25%] min-w-[120px]">Sender</TableHead>
            <TableHead 
              className="w-[25%] min-w-[150px] cursor-pointer group"
              onClick={toggleSortDirection}
              role="button"
              aria-label={`Sort by date ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
            >
              <div className="flex items-center gap-2">
                Date
                {sortDirection === 'asc' ? 
                  <ChevronUp className="w-4 h-4 opacity-50 group-hover:opacity-100" aria-hidden="true" /> : 
                  <ChevronDown className="w-4 h-4 opacity-50 group-hover:opacity-100" aria-hidden="true" />
                }
              </div>
            </TableHead>
            <TableHead className="w-[40%] min-w-[150px]">Subject</TableHead>
            <TableHead className="w-[10%] min-w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto" aria-hidden="true" />
                <span className="sr-only">Loading emails...</span>
              </TableCell>
            </TableRow>
          ) : paginatedEmails && paginatedEmails.length > 0 ? (
            paginatedEmails.map((email: Email, index: number) => (
              <TableRow 
                key={email.id}
                className="transition-all duration-300 animate-fade-in"
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  opacity: 0,
                  animation: 'fade-in 0.3s ease-out forwards'
                }}
              >
                <TableCell className="truncate max-w-[200px]">
                  {email.sender}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatDate(email.date)}
                </TableCell>
                <TableCell className="truncate max-w-[300px]">
                  {email.subject}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    onClick={() => onViewEmail(email)}
                    className="w-full sm:w-auto hover:scale-105 transition-transform duration-200"
                    aria-label={`View email from ${email.sender} with subject ${email.subject}`}
                  >
                    <Eye className="h-4 w-4 mr-2" aria-hidden="true" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No emails yet
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
