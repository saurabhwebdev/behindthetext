"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEFAULT_TEXT_PARAMS } from "@/lib/constants";
import { Download, Loader2, Plus, Trash2, Play } from "lucide-react";

interface BulkItem {
  id: string;
  imageUrl: string;
  text: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  depthThreshold: number;
  positionX: number;
  positionY: number;
  status: "pending" | "generating" | "done" | "error";
  resultUrl?: string;
  error?: string;
}

function createItem(overrides?: Partial<BulkItem>): BulkItem {
  return {
    id: crypto.randomUUID(),
    imageUrl: "",
    text: "YOUR TEXT",
    fontFamily: "Anton",
    fontSize: 120,
    color: "#ffffff",
    depthThreshold: 128,
    positionX: 50,
    positionY: 50,
    status: "pending",
    ...overrides,
  };
}

export default function BulkPage() {
  const [items, setItems] = useState<BulkItem[]>([createItem()]);
  const [isRunning, setIsRunning] = useState(false);

  const updateItem = useCallback((id: string, updates: Partial<BulkItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  }, []);

  const addItem = () => setItems((prev) => [...prev, createItem()]);

  const removeItem = (id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.resultUrl) URL.revokeObjectURL(item.resultUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const generateOne = async (item: BulkItem) => {
    updateItem(item.id, { status: "generating", error: undefined });

    try {
      const body = {
        imageUrl: item.imageUrl,
        text: item.text,
        fontFamily: item.fontFamily,
        fontSize: item.fontSize,
        color: item.color,
        depthThreshold: item.depthThreshold,
        positionX: item.positionX,
        positionY: item.positionY,
        withWatermark: true,
      };

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try {
          const err = await res.json();
          msg = err.error || msg;
        } catch {
          msg = await res.text().catch(() => msg);
        }
        throw new Error(msg);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      updateItem(item.id, { status: "done", resultUrl: url });
    } catch (err: any) {
      updateItem(item.id, { status: "error", error: err.message });
    }
  };

  const generateAll = async () => {
    setIsRunning(true);
    const pending = items.filter((i) => i.status !== "done" && i.imageUrl.trim());

    // Process sequentially to avoid overwhelming the server
    for (const item of pending) {
      await generateOne(item);
    }
    setIsRunning(false);
  };

  const downloadOne = (item: BulkItem) => {
    if (!item.resultUrl) return;
    const a = document.createElement("a");
    a.href = item.resultUrl;
    a.download = `behindthetext-${item.text.replace(/\s+/g, "-").toLowerCase()}.png`;
    a.click();
  };

  const downloadAll = () => {
    items.filter((i) => i.status === "done" && i.resultUrl).forEach(downloadOne);
  };

  const doneCount = items.filter((i) => i.status === "done").length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Bulk Generator</h1>
        <p className="mt-2 text-muted-foreground">
          Generate multiple text-behind-image composites from URLs. Each row = one image.
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 flex items-center gap-3">
        <Button onClick={generateAll} disabled={isRunning}>
          {isRunning ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          {isRunning ? "Generating..." : "Generate All"}
        </Button>
        {doneCount > 0 && (
          <Button variant="outline" onClick={downloadAll}>
            <Download className="mr-2 h-4 w-4" />
            Download All ({doneCount})
          </Button>
        )}
        <Button variant="ghost" onClick={addItem}>
          <Plus className="mr-2 h-4 w-4" />
          Add Row
        </Button>
      </div>

      {/* Items */}
      <div className="space-y-4">
        {items.map((item, idx) => (
          <div
            key={item.id}
            className={`rounded-xl border p-4 ${
              item.status === "done"
                ? "border-green-500/30 bg-green-500/5"
                : item.status === "error"
                ? "border-red-500/30 bg-red-500/5"
                : item.status === "generating"
                ? "border-blue-500/30 bg-blue-500/5"
                : "border-border"
            }`}
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">#{idx + 1}</span>
              {item.status === "generating" && (
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              )}
              {item.status === "done" && (
                <span className="text-xs font-medium text-green-500">Done</span>
              )}
              {item.status === "error" && (
                <span className="text-xs font-medium text-red-500">{item.error}</span>
              )}
              <div className="flex-1" />
              {item.status === "done" && (
                <Button variant="ghost" size="sm" onClick={() => downloadOne(item)}>
                  <Download className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(item.id)}
                disabled={isRunning}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs text-muted-foreground">Image URL</label>
                <Input
                  value={item.imageUrl}
                  onChange={(e) => updateItem(item.id, { imageUrl: e.target.value })}
                  placeholder="https://images.pexels.com/..."
                  className="text-sm"
                  disabled={isRunning}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Text</label>
                <Input
                  value={item.text}
                  onChange={(e) => updateItem(item.id, { text: e.target.value })}
                  placeholder="YOUR TEXT"
                  className="text-sm"
                  disabled={isRunning}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Font</label>
                <Input
                  value={item.fontFamily}
                  onChange={(e) => updateItem(item.id, { fontFamily: e.target.value })}
                  placeholder="Anton"
                  className="text-sm"
                  disabled={isRunning}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Font Size</label>
                <Input
                  type="number"
                  value={item.fontSize}
                  onChange={(e) => updateItem(item.id, { fontSize: Number(e.target.value) })}
                  className="text-sm"
                  disabled={isRunning}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Color</label>
                <Input
                  value={item.color}
                  onChange={(e) => updateItem(item.id, { color: e.target.value })}
                  placeholder="#ffffff"
                  className="text-sm"
                  disabled={isRunning}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Depth (0-255)</label>
                <Input
                  type="number"
                  value={item.depthThreshold}
                  onChange={(e) => updateItem(item.id, { depthThreshold: Number(e.target.value) })}
                  min={0}
                  max={255}
                  className="text-sm"
                  disabled={isRunning}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Position X/Y (%)</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={item.positionX}
                    onChange={(e) => updateItem(item.id, { positionX: Number(e.target.value) })}
                    min={0}
                    max={100}
                    className="text-sm"
                    disabled={isRunning}
                  />
                  <Input
                    type="number"
                    value={item.positionY}
                    onChange={(e) => updateItem(item.id, { positionY: Number(e.target.value) })}
                    min={0}
                    max={100}
                    className="text-sm"
                    disabled={isRunning}
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            {item.resultUrl && (
              <div className="mt-3">
                <img
                  src={item.resultUrl}
                  alt={`Generated: ${item.text}`}
                  className="max-h-48 rounded-lg object-contain"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
