import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { getIndustriesForSelector } from "@/lib/reader-data";
import { useSectionSubscriptions } from "@/lib/use-section-subscriptions";
import { cn } from "@/lib/utils";

interface SectionSelectorDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  selectedSections: string[];
  onSave: (sectionIds: string[]) => void;
}

export function SectionSelectorDialog({
  open,
  onOpenChange,
  selectedSections,
  onSave,
}: SectionSelectorDialogProps) {
  const [localSelected, setLocalSelected] =
    useState<string[]>(selectedSections);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const industries = getIndustriesForSelector();
  const { toggleSubscription } = useSectionSubscriptions();

  const toggleSection = (id: string) => {
    toggleSubscription(id);
    setLocalSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = () => {
    const ids =
      localSelected.length > 0 ? localSelected : ["media-entertainment"];
    onSave(ids);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setLocalSelected(selectedSections);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Выбор разделов</DialogTitle>
        </DialogHeader>

        <div className="max-h-80 space-y-1 overflow-y-auto">
          {industries.map((ind) => {
            const isSelected = localSelected.includes(ind.id);
            const isExpanded = expanded.has(ind.id);
            return (
              <div key={ind.id}>
                <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50">
                  <button
                    type="button"
                    onClick={() => toggleExpand(ind.id)}
                    className="shrink-0 text-gray-400 hover:text-gray-600"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSection(ind.id)}
                    className="h-4 w-4 rounded border-gray-300 text-[#0039CA] focus:ring-[#0039CA]"
                  />
                  <span
                    className={cn(
                      "text-sm",
                      isSelected
                        ? "font-medium text-[#2C3E50]"
                        : "text-gray-500"
                    )}
                  >
                    {ind.name}
                  </span>
                </div>
                {isExpanded && (
                  <div className="ml-8 space-y-1 border-l-2 border-gray-100 pl-3">
                    {ind.subsections.map((sub) => {
                      const subSelected = localSelected.includes(sub.id);
                      return (
                        <div
                          key={sub.id}
                          className="flex items-center gap-2 rounded px-2 py-1 hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={subSelected}
                            onChange={() => toggleSection(sub.id)}
                            className="h-3.5 w-3.5 rounded border-gray-300 text-[#0039CA] focus:ring-[#0039CA]"
                          />
                          <span
                            className={cn(
                              "text-xs",
                              subSelected
                                ? "font-medium text-[#2C3E50]"
                                : "text-gray-500"
                            )}
                          >
                            {sub.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
          <span className="text-xs text-gray-400">
            Выбрано разделов: {localSelected.length}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Отмена
            </Button>
            <Button size="sm" onClick={handleSave}>
              Сохранить
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
