import { Calendar, ArrowLeftRight, Search as SearchIcon, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useRef } from "react";
import { parseWhatsAppChat, Message } from "@/utils/chatParser";
import { toast } from "sonner";

interface ChatHeaderProps {
  onToggleSearch: () => void;
  onSwapSides: () => void;
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  senderNames: string[];
  onMessagesUpdate: (messages: Message[]) => void;
}

export function ChatHeader({ 
  onToggleSearch, 
  onSwapSides, 
  selectedDate, 
  onDateSelect,
  senderNames,
  onMessagesUpdate
}: ChatHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.txt')) {
      toast.error('Please upload a .txt file');
      return;
    }

    try {
      const text = await file.text();
      const messages = parseWhatsAppChat(text);
      
      if (messages.length === 0) {
        toast.error('No valid messages found in the file');
        return;
      }

      localStorage.setItem('whatsapp-messages', JSON.stringify(messages));
      toast.success(`Successfully parsed ${messages.length.toLocaleString()} messages!`);
      onMessagesUpdate(messages);
    } catch (error) {
      console.error('Error parsing file:', error);
      toast.error('Failed to parse the file');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  return (
    <div className="bg-primary text-primary-foreground p-4 shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            {senderNames.length === 2 ? senderNames.join(' & ') : 'WhatsApp Chat'}
          </h1>
          <p className="text-xs opacity-90">Chat Viewer</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={onToggleSearch}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <SearchIcon className="h-5 w-5" />
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            size="icon"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <Upload className="h-5 w-5" />
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <Calendar className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={onDateSelect}
                className="pointer-events-auto"
              />
              {selectedDate && (
                <div className="p-3 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDateSelect(undefined)}
                    className="w-full"
                  >
                    Clear Filter
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
          
          <Button
            size="icon"
            variant="ghost"
            onClick={onSwapSides}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowLeftRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
