import { useState, useEffect, useRef } from "react";
import { parseWhatsAppChat, Message } from "@/utils/chatParser";
import { MessageBubble } from "@/components/MessageBubble";
import { DateSeparator } from "@/components/DateSeparator";
import { SearchBar } from "@/components/SearchBar";
import { ChatHeader } from "@/components/ChatHeader";
import { FileUpload } from "@/components/FileUpload";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [swappedSides, setSwappedSides] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [searchMatches, setSearchMatches] = useState<number[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Load messages on mount - prioritize localStorage, fallback to static JSON
  useEffect(() => {
    const loadMessages = async () => {
      // First check localStorage (for user uploads)
      const stored = localStorage.getItem('whatsapp-messages');
      if (stored) {
        try {
          const parsedMessages = JSON.parse(stored);
          setMessages(parsedMessages);
          setLoading(false);
          return;
        } catch (error) {
          console.error('Error loading stored messages:', error);
        }
      }

      // Fallback to static messages.json
      try {
        const response = await fetch('/messages.json');
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Error loading messages.json:', error);
      }
      
      setLoading(false);
    };

    loadMessages();
  }, []);

  // Scroll to bottom when messages first load
  useEffect(() => {
    if (messages.length > 0 && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages.length]);

  // Get unique senders
  const senderNames = Array.from(new Set(messages.map(m => m.sender)));
  const primarySender = senderNames[0] || "";

  // Filter messages by date if selected
  const filteredMessages = selectedDate
    ? messages.filter(m => {
        const msgDate = new Date(m.datetime);
        return msgDate.toDateString() === selectedDate.toDateString();
      })
    : messages;

  // Search functionality
  useEffect(() => {
    if (!searchTerm) {
      setSearchMatches([]);
      setCurrentMatchIndex(0);
      return;
    }

    const matches: number[] = [];
    filteredMessages.forEach((msg, index) => {
      if (msg.content.toLowerCase().includes(searchTerm.toLowerCase())) {
        matches.push(index);
      }
    });

    setSearchMatches(matches);
    if (matches.length > 0) {
      setCurrentMatchIndex(matches.length - 1); // Start from latest
      scrollToMatch(matches[matches.length - 1]);
    } else {
      setCurrentMatchIndex(0);
    }
  }, [searchTerm, filteredMessages]);

  const scrollToMatch = (index: number) => {
    const element = messageRefs.current.get(index);
    if (element && chatContainerRef.current) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleNextMatch = () => {
    if (searchMatches.length === 0) return;
    const nextIndex = (currentMatchIndex + 1) % searchMatches.length;
    setCurrentMatchIndex(nextIndex);
    scrollToMatch(searchMatches[nextIndex]);
  };

  const handlePreviousMatch = () => {
    if (searchMatches.length === 0) return;
    const prevIndex = currentMatchIndex === 0 
      ? searchMatches.length - 1 
      : currentMatchIndex - 1;
    setCurrentMatchIndex(prevIndex);
    scrollToMatch(searchMatches[prevIndex]);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setShowSearch(false);
  };

  // Group messages by date for rendering
  const renderMessages = () => {
    const elements: JSX.Element[] = [];
    let currentDate = "";

    filteredMessages.forEach((message, index) => {
      // Add date separator if date changed
      if (message.date !== currentDate) {
        currentDate = message.date;
        elements.push(
          <DateSeparator key={`date-${currentDate}`} date={currentDate} />
        );
      }

      // Determine if message is sent or received
      const isSent = swappedSides 
        ? message.sender !== primarySender 
        : message.sender === primarySender;

      // Check if this message is highlighted in search
      const matchIndex = searchMatches.indexOf(index);
      const isHighlighted = matchIndex === currentMatchIndex && matchIndex !== -1;

      elements.push(
        <div
          key={`msg-${index}`}
          ref={(el) => {
            if (el) messageRefs.current.set(index, el);
            else messageRefs.current.delete(index);
          }}
        >
          <MessageBubble
            message={message}
            isSent={isSent}
            searchTerm={searchTerm}
            isHighlighted={isHighlighted}
          />
        </div>
      );
    });

    return elements;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--chat-bg))]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If no messages after loading, show empty chat (user can upload via header)
  if (messages.length === 0 && !loading) {
    return (
      <div className="flex flex-col h-screen bg-[hsl(var(--chat-bg))]">
        <ChatHeader
          onToggleSearch={() => setShowSearch(!showSearch)}
          onSwapSides={() => setSwappedSides(!swappedSides)}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          senderNames={senderNames}
          onMessagesUpdate={setMessages}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p className="text-lg mb-2">No messages loaded</p>
            <p className="text-sm">Upload a WhatsApp chat export using the button above</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[hsl(var(--chat-bg))]">
      <ChatHeader
        onToggleSearch={() => setShowSearch(!showSearch)}
        onSwapSides={() => setSwappedSides(!swappedSides)}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        senderNames={senderNames}
        onMessagesUpdate={setMessages}
      />

      {showSearch && (
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          currentMatch={currentMatchIndex + 1}
          totalMatches={searchMatches.length}
          onPrevious={handlePreviousMatch}
          onNext={handleNextMatch}
          onClear={handleClearSearch}
        />
      )}

      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto pt-4 pb-4"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }}
      >
        {renderMessages()}
      </div>
    </div>
  );
};

export default Index;
