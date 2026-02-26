"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { CanvasPreview } from "./CanvasPreview";
import { EmptyState } from "./EmptyState";
import { FloatingActionBar } from "./FloatingActionBar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { TypographyControls } from "./controls/TypographyControls";
import { StyleControls } from "./controls/StyleControls";
import { PositionControls } from "./controls/PositionControls";
import { EffectsControls } from "./controls/EffectsControls";
import { useTextOverlayState } from "@/hooks/useTextOverlayState";
import { useDepthEstimation } from "@/hooks/useDepthEstimation";
import { useCanvasRenderer } from "@/hooks/useCanvasRenderer";
import { useFontLoader } from "@/hooks/useFontLoader";
import { saveCreationMetadata } from "@/lib/supabase-metadata";
import { PanelRightClose, PanelRightOpen, SlidersHorizontal } from "lucide-react";

export function EditorLayout() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { textParams, setField, reset } = useTextOverlayState();
  const {
    estimateDepth,
    isProcessing,
    progress,
    status,
    depthMap,
    depthWidth,
    depthHeight,
    clearDepth,
  } = useDepthEstimation();

  // Font loader — triggers Google Font loading as side effect
  useFontLoader(textParams.fontFamily, textParams.fontWeight);

  // Image state
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // UI state
  const [controlsOpen, setControlsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("type");
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Load original image element when URL changes
  useEffect(() => {
    if (!originalImageUrl) {
      setOriginalImage(null);
      return;
    }
    const img = new Image();
    img.onload = () => setOriginalImage(img);
    img.src = originalImageUrl;
  }, [originalImageUrl]);

  // Canvas renderer
  const { handleExport } = useCanvasRenderer(
    canvasRef,
    containerRef,
    originalImage,
    textParams,
    depthMap,
    depthWidth,
    depthHeight
  );

  // Handle image upload
  const onImageSelected = useCallback(
    (file: File) => {
      if (originalImageUrl) URL.revokeObjectURL(originalImageUrl);
      setOriginalFile(file);
      const url = URL.createObjectURL(file);
      setOriginalImageUrl(url);
      estimateDepth(file);
    },
    [originalImageUrl, estimateDepth]
  );

  // Handle new image
  const onNewImage = useCallback(() => {
    if (originalImageUrl) URL.revokeObjectURL(originalImageUrl);
    setOriginalFile(null);
    setOriginalImageUrl(null);
    setOriginalImage(null);
    clearDepth();
  }, [originalImageUrl, clearDepth]);

  // Handle export with metadata save
  const onExport = useCallback(
    async (withWatermark: boolean) => {
      if (!originalImage || !originalFile) return;
      setIsExporting(true);
      try {
        await handleExport(withWatermark);

        const dpiScale = Math.min(window.devicePixelRatio, 3);
        saveCreationMetadata({
          image_width: originalImage.naturalWidth,
          image_height: originalImage.naturalHeight,
          image_format: originalFile.type,
          text_content: textParams.text,
          font_family: textParams.fontFamily,
          font_size: textParams.fontSize,
          font_weight: textParams.fontWeight,
          text_color: textParams.color,
          text_params: textParams,
          export_width: Math.round(originalImage.naturalWidth * dpiScale),
          export_height: Math.round(originalImage.naturalHeight * dpiScale),
          dpi_scale: dpiScale,
        }).catch(() => {});
      } finally {
        setIsExporting(false);
      }
    },
    [handleExport, originalImage, originalFile, textParams]
  );

  const hasImage = !!originalImage;

  // Shared tabbed controls content
  const controlsTabs = (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full flex-col">
      <TabsList className="mx-0 grid w-full shrink-0 grid-cols-4">
        <TabsTrigger value="type" className="text-xs">Type</TabsTrigger>
        <TabsTrigger value="style" className="text-xs">Style</TabsTrigger>
        <TabsTrigger value="place" className="text-xs">Place</TabsTrigger>
        <TabsTrigger value="fx" className="text-xs">FX</TabsTrigger>
      </TabsList>
      <div className="controls-scroll min-h-0 flex-1 overflow-y-auto py-3">
        <TabsContent value="type" className="mt-0">
          <TypographyControls textParams={textParams} setField={setField} />
        </TabsContent>
        <TabsContent value="style" className="mt-0">
          <StyleControls textParams={textParams} setField={setField} />
        </TabsContent>
        <TabsContent value="place" className="mt-0">
          <PositionControls textParams={textParams} setField={setField} />
        </TabsContent>
        <TabsContent value="fx" className="mt-0">
          <EffectsControls textParams={textParams} setField={setField} />
        </TabsContent>
      </div>
    </Tabs>
  );

  // Empty state
  if (!hasImage) {
    return (
      <EmptyState onImageSelected={onImageSelected} />
    );
  }

  return (
    <div className="relative flex flex-1 overflow-hidden">
      {/* Canvas — fills entire area */}
      <div className="flex-1">
        <CanvasPreview
          ref={canvasRef}
          containerRef={containerRef}
          isProcessing={isProcessing}
          processingProgress={progress}
          processingStatus={status}
        />
      </div>

      {/* Desktop: floating controls panel */}
      <div className="hidden lg:block">
        {controlsOpen ? (
          <div className="panel-enter absolute bottom-4 right-4 top-4 z-20 flex w-96 flex-col overflow-hidden rounded-2xl border border-border/40 bg-background/80 shadow-2xl backdrop-blur-xl">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border/40 px-4 py-2.5">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Controls
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setControlsOpen(false)}
                className="rounded-full"
              >
                <PanelRightClose className="h-4 w-4" />
              </Button>
            </div>

            {/* Text input — pinned */}
            <div className="shrink-0 border-b border-border/40 px-4 py-2.5">
              <Input
                value={textParams.text}
                onChange={(e) => setField("text", e.target.value)}
                placeholder="YOUR TEXT"
                className="h-10 bg-transparent text-base font-medium"
              />
            </div>

            {/* Tabbed controls — scrollable area */}
            <div className="min-h-0 flex-1 px-4 pt-2 pb-3">
              {controlsTabs}
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="icon"
            onClick={() => setControlsOpen(true)}
            className="absolute right-4 top-4 z-20 rounded-full border-border/40 bg-background/80 shadow-lg backdrop-blur-xl"
          >
            <PanelRightOpen className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Mobile: bottom drawer */}
      <div className="lg:hidden">
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          {/* Peek bar — always visible */}
          <div className="fixed bottom-0 left-0 right-0 z-40">
            <div className="mx-2 rounded-t-2xl border border-b-0 border-border/40 bg-background/90 shadow-2xl backdrop-blur-xl">
              <DrawerTrigger asChild>
                <button className="flex w-full justify-center py-2">
                  <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
                </button>
              </DrawerTrigger>
              <div className="flex items-center gap-2 px-3 pb-3">
                <Input
                  value={textParams.text}
                  onChange={(e) => setField("text", e.target.value)}
                  placeholder="YOUR TEXT"
                  className="h-9 flex-1 bg-transparent text-sm font-medium"
                />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setDrawerOpen(true)}
                  className="shrink-0"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <DrawerContent className="max-h-[70vh]">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-4">
              {controlsTabs}
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Floating action bar — positioned above mobile peek bar */}
      <FloatingActionBar
        onExport={onExport}
        isExporting={isExporting}
        onNewImage={onNewImage}
        onReset={reset}
        previewCanvas={canvasRef.current}
      />
    </div>
  );
}
