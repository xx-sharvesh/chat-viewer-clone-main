export interface Message {
  datetime: string;
  date: string;
  time: string;
  sender: string;
  content: string;
}

export function parseWhatsAppChat(text: string): Message[] {
  const messages: Message[] = [];
  const lines = text.split('\n');
  
  // Regex to match WhatsApp format: DD/MM/YY, HH:MM am/pm - Sender: Message
  const messageRegex = /^(\d{1,2}\/\d{1,2}\/\d{2}),\s+(\d{1,2}:\d{2}\s+[ap]m)\s+-\s+([^:]+):\s+(.+)$/;
  
  for (const line of lines) {
    if (!line.trim()) continue; // Skip empty lines
    
    const match = line.match(messageRegex);
    
    if (match) {
      const [, dateStr, timeStr, sender, content] = match;
      
      // Skip system messages
      if (!sender || !content) continue;
      
      try {
        // Parse date (DD/MM/YY format)
        const [day, month, year] = dateStr.split('/').map(Number);
        const fullYear = 2000 + year; // Convert YY to YYYY
        
        // Parse time
        const timeParts = timeStr.trim().split(' ');
        if (timeParts.length !== 2) continue;
        
        const [timePart, period] = timeParts;
        const [hours, minutes] = timePart.split(':').map(Number);
        let hour24 = hours;
        
        if (period.toLowerCase() === 'pm' && hours !== 12) {
          hour24 = hours + 12;
        } else if (period.toLowerCase() === 'am' && hours === 12) {
          hour24 = 0;
        }
        
        // Create date object
        const msgDate = new Date(fullYear, month - 1, day, hour24, minutes);
        
        messages.push({
          datetime: msgDate.toISOString(),
          date: msgDate.toISOString().split('T')[0], // YYYY-MM-DD
          time: timeStr.trim(),
          sender: sender.trim(),
          content: content.trim()
        });
      } catch (error) {
        // Skip malformed lines
        console.warn('Failed to parse line:', line);
      }
    }
  }
  
  return messages;
}

export function groupMessagesByDate(messages: Message[]): Map<string, Message[]> {
  const grouped = new Map<string, Message[]>();
  
  for (const message of messages) {
    const existing = grouped.get(message.date) || [];
    existing.push(message);
    grouped.set(message.date, existing);
  }
  
  return grouped;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Check if today
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  
  // Check if yesterday
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  
  // Format as "Sep 28, 2024"
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}
