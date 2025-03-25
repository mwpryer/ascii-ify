import { useEffect, useRef, useState } from "react";

type UploadType = "image" | "video" | null;

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [hasUpload, setHasUpload] = useState(false);
  const [type, setType] = useState<UploadType>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationId = useRef<number | null>(null);

  function render() {
    if (!videoRef.current) return;
    paint(videoRef.current);
    animationId.current = requestAnimationFrame(render);
  }

  function paint(source: HTMLImageElement | HTMLVideoElement) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { willReadFrequently: true });
    const container = canvas?.parentElement;
    if (!canvas || !ctx || !container) return;

    const isVideo = source instanceof HTMLVideoElement;
    const sourceWidth = isVideo ? source.videoWidth : source.width;
    const sourceHeight = isVideo ? source.videoHeight : source.height;
    const scaleX = container.clientWidth / sourceWidth;
    const scaleY = container.clientHeight / sourceHeight;
    const scale = Math.max(scaleX, scaleY);

    canvas.width = Math.round(sourceWidth * scale);
    canvas.height = Math.round(sourceHeight * scale);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  }

  async function uploadVideo(file: File) {
    setType("video");

    const video = document.createElement("video");
    videoRef.current = video;
    video.src = URL.createObjectURL(file);
    video.loop = true;
    await new Promise((resolve, reject) => {
      video.onloadedmetadata = () => resolve(null);
      video.onerror = () => reject();
    });
    await video.play();

    render();
  }

  async function uploadImage(file: File) {
    setType("image");

    const img = new Image();
    imageRef.current = img;
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;
    await img.decode();
    URL.revokeObjectURL(objectUrl);

    paint(img);
  }

  async function uploadFile(file: File) {
    if (isUploading || hasUpload) return;
    setIsUploading(true);
    clear();

    try {
      if (file.type.startsWith("video/")) {
        await uploadVideo(file);
      } else {
        await uploadImage(file);
      }

      setHasUpload(true);
    } catch {
      clear();
    } finally {
      setIsUploading(false);
    }
  }

  async function uploadUrl(url: string) {
    if (isUploading || hasUpload) return;
    setIsUploading(true);
    clear();

    try {
      if (/\.(mp4|webm|mov|avi|mkv)$/i.test(url)) {
        await uploadVideoUrl(url);
      } else {
        await uploadImageUrl(url);
      }

      setHasUpload(true);
    } catch {
      clear();
    } finally {
      setIsUploading(false);
    }
  }

  async function uploadVideoUrl(url: string) {
    setType("video");

    const video = document.createElement("video");
    videoRef.current = video;
    video.crossOrigin = "anonymous";
    video.src = url;
    video.loop = true;
    await new Promise((resolve, reject) => {
      video.onloadedmetadata = () => resolve(null);
      video.onerror = () => reject();
    });
    await video.play();

    render();
  }

  async function uploadImageUrl(url: string) {
    setType("image");

    const img = new Image();
    imageRef.current = img;
    img.crossOrigin = "anonymous";
    img.src = url;
    await new Promise((resolve, reject) => {
      img.onload = () => resolve(null);
      img.onerror = () => reject();
    });

    paint(img);
  }

  function clear() {
    setHasUpload(false);
    setType(null);

    if (imageRef.current) {
      imageRef.current = null;
    }

    if (videoRef.current) {
      if (videoRef.current.src?.startsWith("blob:")) {
        URL.revokeObjectURL(videoRef.current.src);
      }
      videoRef.current.pause();
      videoRef.current.src = "";
      videoRef.current.onloadedmetadata = null;
      videoRef.current = null;
    }

    if (animationId.current) {
      cancelAnimationFrame(animationId.current);
      animationId.current = null;
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  // Resize canvas with container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;

    const observer = new ResizeObserver(() => {
      if (hasUpload && imageRef.current) paint(imageRef.current);
    });

    observer.observe(canvas.parentElement);
    return () => observer.disconnect();
  }, [hasUpload]);

  // Cleanup
  useEffect(() => {
    return clear;
  }, []);

  return {
    isUploading,
    hasUpload,
    type,
    inputRef,
    canvasRef,
    uploadFile,
    uploadUrl,
    clear,
    videoRef,
  };
}
