import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { marked } from "marked";
import { formatEmailContent, detectContentType } from "@/utils/content";

interface EmailContentProps {
  content: string | null | undefined;
}

export const EmailContent = ({ content }: EmailContentProps) => {
  const safeContent = content || '';
  const contentType = detectContentType(safeContent);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Message:</label>
      <Tabs defaultValue={contentType} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="html" className="text-xs sm:text-sm">HTML</TabsTrigger>
          <TabsTrigger value="markdown" className="text-xs sm:text-sm">Markdown</TabsTrigger>
          <TabsTrigger value="text" className="text-xs sm:text-sm">Plain Text</TabsTrigger>
        </TabsList>
        
        <TabsContent value="html">
          <div className="mt-2 p-2 sm:p-4 rounded-md bg-secondary/50">
            <div 
              className="prose prose-sm dark:prose-invert max-w-none overflow-x-hidden text-xs sm:text-sm"
              dangerouslySetInnerHTML={{ 
                __html: formatEmailContent(safeContent) 
              }} 
            />
          </div>
        </TabsContent>
        
        <TabsContent value="markdown">
          <div className="mt-2 p-2 sm:p-4 rounded-md bg-secondary/50">
            <div 
              className="prose prose-sm dark:prose-invert max-w-none overflow-x-hidden text-xs sm:text-sm"
              dangerouslySetInnerHTML={{ 
                __html: marked(safeContent, { breaks: true }) 
              }} 
            />
          </div>
        </TabsContent>
        
        <TabsContent value="text">
          <div className="mt-2 p-2 sm:p-4 rounded-md bg-secondary/50">
            <pre className="whitespace-pre-wrap font-inherit break-words overflow-x-hidden text-xs sm:text-sm">
              {safeContent}
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
