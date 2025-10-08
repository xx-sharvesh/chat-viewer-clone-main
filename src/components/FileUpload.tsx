import { useState } from "react";
import { Upload, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { parseWhatsAppChat, Message } from "@/utils/chatParser";
import { toast } from "sonner";

interface FileUploadProps {
  onMessagesLoaded: (messages: Message[]) => void;
}

export function FileUpload({ onMessagesLoaded }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [parsing, setParsing] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.txt')) {
      toast.error('Please upload a .txt file');
      return;
    }

    setParsing(true);
    
    try {
      const text = await file.text();
      const messages = parseWhatsAppChat(text);
      
      if (messages.length === 0) {
        toast.error('No valid messages found in the file');
        setParsing(false);
        return;
      }

      // Store in localStorage
      localStorage.setItem('whatsapp-messages', JSON.stringify(messages));
      
      toast.success(`Successfully parsed ${messages.length.toLocaleString()} messages!`);
      onMessagesLoaded(messages);
    } catch (error) {
      console.error('Error parsing file:', error);
      toast.error('Failed to parse the file');
    } finally {
      setParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const downloadJSON = () => {
    const stored = localStorage.getItem('whatsapp-messages');
    if (!stored) {
      toast.error('No messages to download');
      return;
    }

    const blob = new Blob([stored], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'messages.json';
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('JSON file downloaded!');
  };

  const loadExisting = () => {
    const stored = localStorage.getItem('whatsapp-messages');
    if (stored) {
      try {
        const messages = JSON.parse(stored);
        onMessagesLoaded(messages);
        toast.success(`Loaded ${messages.length.toLocaleString()} messages from storage`);
      } catch (error) {
        toast.error('Failed to load stored messages');
      }
    }
  };

  const hasStoredData = localStorage.getItem('whatsapp-messages');

  return (
    <div className="min-h-screen bg-[hsl(var(--chat-bg))] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">WhatsApp Chat Viewer</CardTitle>
          <CardDescription>
            Upload your WhatsApp chat export (.txt file) to get started
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-lg p-12 text-center transition-colors
              ${isDragging ? 'border-primary bg-primary/5' : 'border-border'}
              ${parsing ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
            `}
          >
            <input
              type="file"
              accept=".txt"
              onChange={handleFileInput}
              className="hidden"
              id="file-input"
              disabled={parsing}
            />
            
            <label htmlFor="file-input" className="cursor-pointer">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                {parsing ? 'Parsing messages...' : 'Drop your .txt file here'}
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse
              </p>
            </label>
          </div>

          {hasStoredData && (
            <div className="space-y-2">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={loadExisting} 
                  variant="outline" 
                  className="flex-1"
                >
                  Load Saved Chat
                </Button>
                <Button 
                  onClick={downloadJSON} 
                  variant="outline"
                  size="icon"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            <p>💡 <strong>How to export WhatsApp chat:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Open WhatsApp and go to the chat</li>
              <li>Tap Menu (⋮) → More → Export chat</li>
              <li>Choose "Without Media"</li>
              <li>Upload the .txt file here</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
