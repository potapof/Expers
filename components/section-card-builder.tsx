"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  AlignLeft,
  ImageIcon,
  PanelLeft,
  PanelRight,
  Table2,
  Bold,
  Italic,
  Link,
  Save,
  Trash2,
  Pencil,
  Plus,
  GripVertical,
  X,
  Columns2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface ArticleSection {
  id: string;
  title: string;
  description: string;
  design: "text-only" | "image-only" | "image-right" | "image-left" | "table";
  text: string;
  imageRatio: number;
  imageData?: string;
  tableData: {
    headers: string[];
    rows: string[][];
  };
}

export const DESIGN_OPTIONS = [
  { id: "text-only" as const, label: "Только текст", icon: AlignLeft },
  { id: "image-only" as const, label: "Только картинка", icon: ImageIcon },
  {
    id: "image-right" as const,
    label: "Картинка справа",
    icon: PanelRight,
  },
  {
    id: "image-left" as const,
    label: "Картинка слева",
    icon: PanelLeft,
  },
  { id: "table" as const, label: "Таблица", icon: Table2 },
];

const DEMO_TEXT =
  "Это пример текста для раздела статьи. Здесь вы можете описать основные концепции и идеи. Используйте форматирование для выделения важных <strong>моментов</strong> или <em>акцентов</em>. Вставляйте <a href='#'>ссылки</a> на источники.";

const SVG_PLACEHOLDER = `<svg viewBox="0 0 400 300" style="width:100%;height:100%;" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="#f0f0f0" rx="16"/>
  <rect x="80" y="60" width="240" height="180" rx="12" fill="#e0e0e0" stroke="#c0c0c0" stroke-width="1.5"/>
  <circle cx="160" cy="150" r="30" fill="#d0d0d0"/>
  <polygon points="120,230 200,140 280,230" fill="#d0d0d0"/>
  <line x1="80" y1="230" x2="320" y2="230" stroke="#c0c0c0" stroke-width="1.5"/>
</svg>`;

export function buildContentFromSections(sections: ArticleSection[]): string {
  return sections
    .map((s) => {
      const parts: string[] = [];
      if (s.title) parts.push(`## ${s.title}`);
      if (s.description) parts.push(s.description);
      const textContent = s.text.replace(/<[^>]*>/g, "");
      if (textContent.trim()) parts.push(textContent.trim());
      if (s.design === "table" && s.tableData.headers.length > 0) {
        parts.push(`| ${s.tableData.headers.join(" | ")} |`);
        parts.push(`| ${s.tableData.headers.map(() => "---").join(" | ")} |`);
        for (const row of s.tableData.rows) {
          parts.push(`| ${row.join(" | ")} |`);
        }
      }
      return parts.join("\n\n");
    })
    .join("\n\n");
}

function ImagePlaceholder({
  imageData,
  onImageSelect,
}: {
  imageData?: string;
  onImageSelect?: (dataUrl: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onImageSelect?.(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  if (imageData) {
    return (
      <div
        className="w-full h-full min-h-[200px] flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200 overflow-hidden cursor-pointer relative group"
        onClick={handleClick}
      >
        <img src={imageData} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm">
            Заменить
          </span>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    );
  }

  return (
    <div
      className="w-full h-48 bg-gray-50 rounded-lg border border-dashed border-gray-200 overflow-hidden cursor-pointer hover:bg-gray-100 transition-colors relative"
      onClick={handleClick}
    >
      <div
        className="absolute inset-0"
        dangerouslySetInnerHTML={{ __html: SVG_PLACEHOLDER }}
      />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

function DesignSelector({
  value,
  onChange,
}: {
  value: ArticleSection["design"];
  onChange: (v: ArticleSection["design"]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {DESIGN_OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const selected = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              selected
                ? "border-[#3498DB] bg-blue-50 text-[#3498DB]"
                : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function InlineToolbar({
  editorRef,
  onTextChange,
}: {
  editorRef: React.RefObject<HTMLDivElement | null>;
  onTextChange?: (html: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const toolbarRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);

  useEffect(() => {
    const handleMouseUp = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.toString().trim()) {
        setVisible(false);
        return;
      }

      const editorEl = editorRef.current;
      if (!editorEl) return;
      if (
        !editorEl.contains(sel.anchorNode) &&
        !editorEl.contains(sel.focusNode)
      ) {
        setVisible(false);
        return;
      }

      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const editorRect = editorEl.getBoundingClientRect();

      setPosition({
        top: rect.top - editorRect.top - 40,
        left: rect.left - editorRect.left + rect.width / 2,
      });
      setVisible(true);
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (
        toolbarRef.current &&
        !toolbarRef.current.contains(e.target as Node)
      ) {
        setVisible(false);
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [editorRef]);

  function notifyChange() {
    const editorEl = editorRef.current;
    if (!editorEl) return;
    onTextChange?.(editorEl.innerHTML);
  }

  function findAncestorTag(
    node: Node | null,
    tagName: string,
    limit: Node
  ): HTMLElement | null {
    while (node && node !== limit) {
      if (node.nodeType === 1 && (node as HTMLElement).tagName === tagName) {
        return node as HTMLElement;
      }
      node = node.parentNode;
    }
    return null;
  }

  function applyFormat(cmd: "bold" | "italic") {
    const tagName = cmd === "bold" ? "STRONG" : "EM";
    const wrapperTag = cmd === "bold" ? "strong" : "em";

    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) return;

    const editorEl = editorRef.current;
    if (!editorEl) return;

    const range = sel.getRangeAt(0);
    const existing = findAncestorTag(
      range.commonAncestorContainer,
      tagName,
      editorEl
    );

    if (existing) {
      const parent = existing.parentNode!;
      while (existing.firstChild) {
        parent.insertBefore(existing.firstChild, existing);
      }
      parent.removeChild(existing);
      sel.removeAllRanges();
      sel.addRange(range);
      notifyChange();
      setVisible(false);
      return;
    }

    const wrapper = document.createElement(wrapperTag);
    try {
      range.surroundContents(wrapper);
    } catch {
      const fragment = range.extractContents();
      wrapper.appendChild(fragment);
      range.insertNode(wrapper);
    }

    sel.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(wrapper);
    sel.addRange(newRange);
    notifyChange();
    setVisible(false);
  }

  function handleLink() {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) return;

    const editorEl = editorRef.current;
    if (!editorEl) return;

    const range = sel.getRangeAt(0);
    const existing = findAncestorTag(
      range.commonAncestorContainer,
      "A",
      editorEl
    );

    if (existing) {
      const parent = existing.parentNode!;
      while (existing.firstChild) {
        parent.insertBefore(existing.firstChild, existing);
      }
      parent.removeChild(existing);
      sel.removeAllRanges();
      sel.addRange(range);
      notifyChange();
      setVisible(false);
      return;
    }

    savedRangeRef.current = range.cloneRange();
    setLinkUrl("");
    setLinkDialogOpen(true);
  }

  function applyLink() {
    const range = savedRangeRef.current;
    const editorEl = editorRef.current;
    if (!range || !editorEl) return;

    const url = linkUrl.trim();
    if (!url) return;

    const sel = window.getSelection();
    const wrapper = document.createElement("a");
    wrapper.setAttribute("href", url);

    try {
      range.surroundContents(wrapper);
    } catch {
      const fragment = range.extractContents();
      wrapper.appendChild(fragment);
      range.insertNode(wrapper);
    }

    if (sel) {
      sel.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(wrapper);
      sel.addRange(newRange);
    }

    notifyChange();
    setLinkDialogOpen(false);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <>
      <div
        ref={toolbarRef}
        className="absolute z-50 flex items-center gap-0.5 rounded-lg border border-gray-200 bg-white shadow-lg px-1 py-1"
        style={{
          top: position.top,
          left: position.left,
          transform: "translateX(-50%)",
        }}
      >
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormat("bold");
          }}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-700"
          title="Жирный"
        >
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormat("italic");
          }}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-700"
          title="Курсив"
        >
          <Italic className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            handleLink();
          }}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-700"
          title="Ссылка"
        >
          <Link className="h-3.5 w-3.5" />
        </button>
      </div>

      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Вставить ссылку</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyLink();
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setLinkDialogOpen(false)}
              >
                Отмена
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={applyLink}
                disabled={!linkUrl.trim()}
              >
                Сохранить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ResizableSplit({
  imageRatio,
  onRatioChange,
  textContent,
  onTextChange,
  editorRef,
  imagePosition,
  imageData,
  onImageSelect,
}: {
  imageRatio: number;
  onRatioChange: (r: number) => void;
  textContent: string;
  onTextChange: (v: string) => void;
  editorRef: React.RefObject<HTMLDivElement | null>;
  imagePosition: "left" | "right";
  imageData?: string;
  onImageSelect?: (dataUrl: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      let ratio = (x / rect.width) * 100;
      ratio = Math.max(20, Math.min(80, ratio));
      if (imagePosition === "right") {
        ratio = 100 - ratio;
      }
      onRatioChange(Math.round(ratio));
    };

    const handleMouseUp = () => {
      if (dragging.current) {
        dragging.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [imagePosition, onRatioChange]);

  const textWidth =
    imagePosition === "right" ? 100 - imageRatio : 100 - imageRatio;
  const imageWidth = imageRatio;

  return (
    <div
      ref={containerRef}
      className="flex w-full gap-0 relative min-h-[200px]"
    >
      <div
        className="relative overflow-hidden"
        style={{
          width: `${imagePosition === "left" ? imageWidth : textWidth}%`,
        }}
      >
        {imagePosition === "left" ? (
          <ImagePlaceholder
            imageData={imageData}
            onImageSelect={onImageSelect}
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            className="w-full h-full min-h-[200px] p-3 text-sm text-gray-700 leading-relaxed outline-none rounded-lg border border-gray-200 focus:border-[#3498DB] focus:ring-1 focus:ring-[#3498DB] overflow-auto"
            dangerouslySetInnerHTML={{ __html: textContent }}
            onInput={(e) =>
              onTextChange((e.target as HTMLDivElement).innerHTML)
            }
          />
        )}
      </div>

      <div
        className="shrink-0 w-2 cursor-col-resize flex items-center justify-center hover:bg-blue-100 active:bg-blue-200 transition-colors rounded"
        onMouseDown={handleMouseDown}
      >
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>

      <div
        className="relative overflow-hidden"
        style={{
          width: `${imagePosition === "right" ? imageWidth : textWidth}%`,
        }}
      >
        {imagePosition === "right" ? (
          <ImagePlaceholder
            imageData={imageData}
            onImageSelect={onImageSelect}
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            className="w-full h-full min-h-[200px] p-3 text-sm text-gray-700 leading-relaxed outline-none rounded-lg border border-gray-200 focus:border-[#3498DB] focus:ring-1 focus:ring-[#3498DB] overflow-auto"
            dangerouslySetInnerHTML={{ __html: textContent }}
            onInput={(e) =>
              onTextChange((e.target as HTMLDivElement).innerHTML)
            }
          />
        )}
      </div>
    </div>
  );
}

function TableEditor({
  data,
  onChange,
}: {
  data: { headers: string[]; rows: string[][] };
  onChange: (d: { headers: string[]; rows: string[][] }) => void;
}) {
  function addColumn() {
    onChange({
      headers: [...data.headers, `Колонка ${data.headers.length + 1}`],
      rows: data.rows.map((r) => [...r, ""]),
    });
  }

  function removeColumn(index: number) {
    if (data.headers.length <= 1) return;
    onChange({
      headers: data.headers.filter((_, i) => i !== index),
      rows: data.rows.map((r) => r.filter((_, i) => i !== index)),
    });
  }

  function addRow() {
    onChange({
      ...data,
      rows: [...data.rows, data.headers.map(() => "")],
    });
  }

  function removeRow(index: number) {
    if (data.rows.length <= 1) return;
    onChange({
      ...data,
      rows: data.rows.filter((_, i) => i !== index),
    });
  }

  function updateHeader(index: number, value: string) {
    const next = [...data.headers];
    next[index] = value;
    onChange({ ...data, headers: next });
  }

  function updateCell(rowIndex: number, colIndex: number, value: string) {
    const next = [...data.rows];
    next[rowIndex] = [...next[rowIndex]];
    next[rowIndex][colIndex] = value;
    onChange({ ...data, rows: next });
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="w-8 p-2" />
              {data.headers.map((h, ci) => (
                <th key={ci} className="p-1">
                  <div className="flex items-center gap-1">
                    <Input
                      value={h}
                      onChange={(e) => updateHeader(ci, e.target.value)}
                      className="h-7 text-xs border-0 bg-transparent focus:bg-white rounded"
                      placeholder={`Колонка ${ci + 1}`}
                    />
                    {data.headers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeColumn(ci)}
                        className="shrink-0 p-0.5 text-gray-400 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
              <th className="w-8 p-2">
                <button
                  type="button"
                  onClick={addColumn}
                  className="p-1 text-gray-400 hover:text-[#3498DB] transition-colors"
                  title="Добавить колонку"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, ri) => (
              <tr key={ri} className="border-t border-gray-100">
                <td className="p-2 text-center">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400">{ri + 1}</span>
                    {data.rows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRow(ri)}
                        className="p-0.5 text-gray-400 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </td>
                {row.map((cell, ci) => (
                  <td key={ci} className="p-1">
                    <Input
                      value={cell}
                      onChange={(e) => updateCell(ri, ci, e.target.value)}
                      className="h-7 text-xs border-0 bg-transparent focus:bg-white rounded"
                      placeholder="..."
                    />
                  </td>
                ))}
                <td />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addRow}
        className="gap-1 text-xs"
      >
        <Plus className="h-3 w-3" />
        Добавить строку
      </Button>
    </div>
  );
}

function SectionCard({
  section,
  index,
  onChange,
  onDelete,
}: {
  section: ArticleSection;
  index: number;
  onChange: (s: ArticleSection) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(true);
  const editorRef = useRef<HTMLDivElement>(null);

  function update(partial: Partial<ArticleSection>) {
    onChange({ ...section, ...partial });
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            Раздел {index + 1}
          </span>
          <div className="flex items-center gap-1">
            {editing ? (
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#3498DB] hover:bg-blue-50 transition-colors"
              >
                <Save className="h-3.5 w-3.5" />
                Сохранить
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" />
                Редактировать
              </button>
            )}
            <button
              type="button"
              onClick={onDelete}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Удалить
            </button>
          </div>
        </div>

        {editing ? (
          <>
            <div className="space-y-3">
              <div>
                <Input
                  value={section.title}
                  onChange={(e) => update({ title: e.target.value })}
                  placeholder="Название раздела (опционально)"
                  className="text-sm font-medium"
                />
              </div>
              <div>
                <textarea
                  value={section.description}
                  onChange={(e) => update({ description: e.target.value })}
                  placeholder="Описание раздела (опционально)"
                  rows={2}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition-colors resize-none focus:border-[#3498DB] focus:ring-1 focus:ring-[#3498DB]"
                />
              </div>
              <DesignSelector
                value={section.design}
                onChange={(v) => update({ design: v })}
              />
            </div>

            <div className="relative">
              <InlineToolbar
                editorRef={editorRef}
                onTextChange={(html) => update({ text: html })}
              />
              {section.design === "text-only" && (
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  className="w-full min-h-[200px] p-3 text-sm text-gray-700 leading-relaxed outline-none rounded-lg border border-gray-200 focus:border-[#3498DB] focus:ring-1 focus:ring-[#3498DB] overflow-auto"
                  dangerouslySetInnerHTML={{ __html: section.text }}
                  onInput={(e) =>
                    update({ text: (e.target as HTMLDivElement).innerHTML })
                  }
                />
              )}
              {section.design === "image-only" && (
                <ImagePlaceholder
                  imageData={section.imageData}
                  onImageSelect={(dataUrl) => update({ imageData: dataUrl })}
                />
              )}
              {(section.design === "image-right" ||
                section.design === "image-left") && (
                <ResizableSplit
                  imageRatio={section.imageRatio}
                  onRatioChange={(r) => update({ imageRatio: r })}
                  textContent={section.text}
                  onTextChange={(v) => update({ text: v })}
                  editorRef={editorRef}
                  imagePosition={
                    section.design === "image-left" ? "left" : "right"
                  }
                  imageData={section.imageData}
                  onImageSelect={(dataUrl) => update({ imageData: dataUrl })}
                />
              )}
              {section.design === "table" && (
                <TableEditor
                  data={section.tableData}
                  onChange={(d) => update({ tableData: d })}
                />
              )}
            </div>
          </>
        ) : (
          <div className="space-y-3">
            {section.title && (
              <h3 className="text-base font-semibold text-[#2C3E50]">
                {section.title}
              </h3>
            )}
            {section.description && (
              <p className="text-sm text-gray-500">{section.description}</p>
            )}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Columns2 className="h-3.5 w-3.5 text-[#3498DB]" />
                <span className="text-xs font-medium text-gray-400">
                  {DESIGN_OPTIONS.find((d) => d.id === section.design)?.label}
                </span>
                {section.design !== "text-only" &&
                  section.design !== "table" && (
                    <span className="text-xs text-gray-400">
                      (изображение {section.imageRatio}%)
                    </span>
                  )}
              </div>
              {section.design === "text-only" && section.text && (
                <div
                  className="text-sm text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: section.text }}
                />
              )}
              {(section.design === "image-right" ||
                section.design === "image-left") && (
                <div className="flex gap-2 items-start">
                  {section.design === "image-left" && (
                    <div className="w-1/3 shrink-0 h-48">
                      <ImagePlaceholder
                        imageData={section.imageData}
                        onImageSelect={(dataUrl) =>
                          update({ imageData: dataUrl })
                        }
                      />
                    </div>
                  )}
                  {section.text && (
                    <div
                      className="text-sm text-gray-700 leading-relaxed flex-1"
                      dangerouslySetInnerHTML={{ __html: section.text }}
                    />
                  )}
                  {section.design === "image-right" && (
                    <div className="w-1/3 shrink-0 h-48">
                      <ImagePlaceholder
                        imageData={section.imageData}
                        onImageSelect={(dataUrl) =>
                          update({ imageData: dataUrl })
                        }
                      />
                    </div>
                  )}
                </div>
              )}
              {section.design === "image-only" && (
                <ImagePlaceholder
                  imageData={section.imageData}
                  onImageSelect={(dataUrl) => update({ imageData: dataUrl })}
                />
              )}
              {section.design === "table" &&
                section.tableData.headers.length > 0 && (
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          {section.tableData.headers.map((h, ci) => (
                            <th
                              key={ci}
                              className="px-3 py-2 text-left text-xs font-medium text-gray-500"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {section.tableData.rows.map((row, ri) => (
                          <tr key={ri} className="border-t border-gray-100">
                            {row.map((cell, ci) => (
                              <td
                                key={ci}
                                className="px-3 py-2 text-xs text-gray-700"
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function SectionCardBuilder({
  sections,
  onChange,
  errors,
}: {
  sections: ArticleSection[];
  onChange: (sections: ArticleSection[]) => void;
  errors: Record<string, string>;
}) {
  function addSection() {
    const newSection: ArticleSection = {
      id: `section-${crypto.randomUUID()}`,
      title: "",
      description: "",
      design: "image-right",
      text: DEMO_TEXT,
      imageRatio: 45,
      tableData: { headers: [], rows: [] },
    };
    onChange([...sections, newSection]);
  }

  function updateSection(index: number, section: ArticleSection) {
    const next = [...sections];
    next[index] = section;
    onChange(next);
  }

  function deleteSection(index: number) {
    if (sections.length <= 1) return;
    onChange(sections.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="mb-8">
        <span className="text-xs font-medium text-[#3498DB] uppercase tracking-wide">
          Шаг 7 из 12
        </span>
        <h2 className="text-2xl font-bold text-[#2C3E50] mt-1 mb-2">
          Конструктор статьи
        </h2>
        <p className="text-sm text-gray-500">
          Создайте структуру статьи из карточек-разделов с разными дизайнами
        </p>
      </div>

      <div className="space-y-4">
        {sections.map((section, index) => (
          <SectionCard
            key={section.id}
            section={section}
            index={index}
            onChange={(s) => updateSection(index, s)}
            onDelete={() => deleteSection(index)}
          />
        ))}
      </div>

      <div className="mt-4">
        <Button
          type="button"
          variant="outline"
          onClick={addSection}
          className="gap-2 w-full"
        >
          <Plus className="h-4 w-4" />
          Добавить раздел
        </Button>
      </div>

      {errors.sections && (
        <p className="text-xs text-red-500 mt-2">{errors.sections}</p>
      )}
    </div>
  );
}
