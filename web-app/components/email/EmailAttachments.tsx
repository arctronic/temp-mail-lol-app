import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { formatFileSize } from "@/utils/fileSize";
import type { Email } from "@/contexts/EmailContext";
import { trackEvent } from "@/utils/analytics";

interface EmailAttachmentsProps {
  attachments: Email['attachments'];
}

export const EmailAttachments = ({ attachments }: EmailAttachmentsProps) => {
  if (!attachments?.length) return null;

  const handleDownload = (attachment: Email['attachments'][0]) => {
    // Track attachment download
    trackEvent({
      category: 'Email',
      action: 'DownloadAttachment',
      label: attachment.filename
    });

    // Download the attachment
    const link = document.createElement('a');
    link.href = `data:application/octet-stream;base64,${attachment.data.$binary.base64}`;
    link.download = attachment.filename;
    link.click();
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Attachments ({attachments.length}):
      </label>
      <div className="flex flex-col space-y-2 p-2 bg-secondary/50 rounded-md">
        {attachments.map((attachment, index) => (
          <Button
            key={index}
            variant="secondary"
            size="sm"
            onClick={() => handleDownload(attachment)}
            className="flex items-center justify-between gap-2 w-full hover:bg-secondary/80 px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm"
            title={attachment.filename}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Copy className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {attachment.filename}
              </span>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
              {formatFileSize(attachment.data.$binary.base64)}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
};
