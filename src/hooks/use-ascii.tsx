import { useCallback, useEffect, useRef, useState } from "react";

import { AsciiConfig, generateAsciiText, renderAscii } from "@/lib/ascii";

export function useAscii(
  source: HTMLCanvasElement | null,
  config: AsciiConfig,
) {
  const [isActive, setIsActive] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationId = useRef<number | null>(null);

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

    const ascii = await generateAsciiText(source, config);
    try {
      await navigator.clipboard.writeText(ascii);
      return true;
    } catch {
      return false;
    }
  }

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    link.download = `ascii-${timestamp}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
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

  return { isActive, canvasRef, show, hide, copy, download };
}
