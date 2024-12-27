import { useEffect, useRef, useState } from "react";

export function useWebcam() {
  const [isLoading, setIsLoading] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationId = useRef<number | null>(null);

  function render() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { willReadFrequently: true });
    if (!video || !canvas || !ctx) {
      animationId.current = requestAnimationFrame(render);
      return;
    }

    // Early return if video is not ready
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      animationId.current = requestAnimationFrame(render);
      return;
    }

    // Fit to 4:3 aspect ratio
    const canvasWidth = 1280;
    const canvasHeight = 960;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const scaleX = canvasWidth / video.videoWidth;
    const scaleY = canvasHeight / video.videoHeight;
    const scale = Math.max(scaleX, scaleY);
    const x = (canvasWidth - video.videoWidth * scale) / 2;
    const y = (canvasHeight - video.videoHeight * scale) / 2;
    ctx.drawImage(
      video,
      x,
      y,
      video.videoWidth * scale,
      video.videoHeight * scale,
    );

    animationId.current = requestAnimationFrame(render);
  }

  async function start() {
    if (isLoading || isActive) return;

    setIsLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
      });
      streamRef.current = stream;

      const video = document.createElement("video");
      videoRef.current = video;
      video.srcObject = stream;
      await new Promise((resolve) => (video.onloadedmetadata = resolve));
      await video.play();

      render();
      setIsActive(true);
    } catch {
      stop();
    } finally {
      setIsLoading(false);
    }
  }

  function stop() {
    setIsActive(false);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
      videoRef.current.onloadedmetadata = null;
      videoRef.current = null;
    }

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

  useEffect(() => {
    return stop;
  }, []);

  return {
    isLoading,
    isActive,
    canvasRef,
    start,
    stop,
  };
}
