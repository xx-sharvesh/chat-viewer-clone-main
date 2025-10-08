import { Search, ChevronUp, ChevronDown, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  currentMatch: number;
  totalMatches: number;
  onPrevious: () => void;
  onNext: () => void;
  onClear: () => void;
}

export function SearchBar({
  searchTerm,
  onSearchChange,
  currentMatch,
  totalMatches,
  onPrevious,
  onNext,
  onClear
}: SearchBarProps) {
  return (
    <div className="flex items-center gap-2 p-3 bg-background border-b border-border">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search messages..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pr-20"
        />
        {totalMatches > 0 && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {currentMatch}/{totalMatches}
          </div>
        )}
      </div>
      
      <div className="flex gap-1">
        <Button
          size="icon"
          variant="ghost"
          onClick={onPrevious}
          disabled={totalMatches === 0}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={onNext}
          disabled={totalMatches === 0}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClear}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
