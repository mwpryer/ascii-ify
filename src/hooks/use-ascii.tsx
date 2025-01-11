import { useCallback, useEffect, useRef, useState } from "react";

import {
  AsciiConfig,
  generateAsciiText,
  recordAscii,
  renderAscii,
} from "@/lib/ascii";

export function useAscii(
  source: HTMLCanvasElement | null,
  config: AsciiConfig,
) {
  const [isActive, setIsActive] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationId = useRef<number | null>(null);

  // Render loop
  const render = useCallback(() => {
    const target = canvasRef.current;
    if (!source || !target) return;

    if (animationId.current) {
      cancelAnimationFrame(animationId.current);
      animationId.current = null;
    }

    renderAscii(source, target, config);

    if (config.animate) {
      animationId.current = requestAnimationFrame(render);
    }
  }, [source, config]);

  function show() {
    setIsActive(true);
    render();
  }

  function hide() {
    setIsActive(false);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    if (animationId.current) {
      cancelAnimationFrame(animationId.current);
      animationId.current = null;
    }
  }

  async function copy() {
    if (!source) return false;

    try {
      const ascii = await generateAsciiText(source, config);
      await navigator.clipboard.writeText(ascii);
      return true;
    } catch {
      return false;
    }
  }

  async function download(video?: HTMLVideoElement) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDownloading(true);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `ascii-${timestamp}`;

    if (video && video.duration > 0) {
      // Handle video download
      const link = document.createElement("a");
      const format = MediaRecorder.isTypeSupported("video/mp4")
        ? "video/mp4"
        : "video/webm";
      const blob = await recordAscii(video, config, format);
      const objectUrl = URL.createObjectURL(blob);
      link.href = objectUrl;
      link.download = `${filename}.${format.split("/")[1]}`;
      link.click();
      URL.revokeObjectURL(objectUrl);
    } else {
      // Handle image download
      const link = document.createElement("a");
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }

    setIsDownloading(false);
  }

  // Reset animation on config change
  useEffect(() => {
    if (isActive) {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
        animationId.current = null;
      }
      render();
    }
  }, [config, isActive, render]);

  // Resize canvas with container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;

    const observer = new ResizeObserver(() => {
      if (isActive) render();
    });

    observer.observe(canvas.parentElement);
    return () => observer.disconnect();
  }, [isActive, render]);

  // Cleanup
  useEffect(() => {
    return hide;
  }, []);

  return {
    isActive,
    isDownloading,
    canvasRef,
    show,
    hide,
    copy,
    download,
  };
}
