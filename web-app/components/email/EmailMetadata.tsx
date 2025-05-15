
import { formatDate } from "@/utils/date";
import type { Email } from "@/contexts/EmailContext";

interface EmailMetadataProps {
  email: Email;
}

export const EmailMetadata = ({ email }: EmailMetadataProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">From:</label>
        <div className="p-2 mt-1 bg-secondary/50 rounded-md break-all text-xs sm:text-sm">
          {email.sender}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">To:</label>
        <div className="p-2 mt-1 bg-secondary/50 rounded-md break-all text-xs sm:text-sm">
          {email.receiver}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Subject:</label>
        <div className="p-2 mt-1 bg-secondary/50 rounded-md break-all text-xs sm:text-sm">
          {email.subject}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Date:</label>
        <div className="p-2 mt-1 bg-secondary/50 rounded-md text-xs sm:text-sm">
          {formatDate(email.date)}
        </div>
      </div>
    </div>
  );
};
