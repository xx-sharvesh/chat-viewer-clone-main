import { formatDate } from "@/utils/chatParser";

interface DateSeparatorProps {
  date: string;
}

export function DateSeparator({ date }: DateSeparatorProps) {
  return (
    <div className="flex items-center justify-center my-4">
      <div className="bg-[hsl(var(--date-separator))] text-foreground text-xs px-3 py-1 rounded-lg shadow-sm">
        {formatDate(date)}
      </div>
    </div>
  );
}
