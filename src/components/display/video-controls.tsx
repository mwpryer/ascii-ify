import { useEffect, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface VideoControlsProps extends React.ComponentProps<"div"> {
  videoRef: React.RefObject<HTMLVideoElement>;
}
export function VideoControls({
  videoRef,
  className,
  ...props
}: VideoControlsProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleDurationChange = () => {
      if (video.duration && !isNaN(video.duration)) {
        setDuration(video.duration);
      }
    };

    const handleMetadataLoaded = () => {
      if (video.duration && !isNaN(video.duration)) {
        setDuration(video.duration);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("loadedmetadata", handleMetadataLoaded);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    // Handle case where video is already loaded
    if (video.readyState >= 1 && video.duration && !isNaN(video.duration)) {
      setDuration(video.duration);
    }

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("durationchange", handleDurationChange);
      video.removeEventListener("loadedmetadata", handleMetadataLoaded);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, [videoRef]);

  function togglePlayPause() {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  }

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(!isMuted);
  }

  function handleSeek(value: number[]) {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = value[0];
  }

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 z-50 flex h-12 items-center gap-2 bg-background/80 p-2 opacity-0 backdrop-blur transition-opacity duration-100 group-hover:pointer-events-auto group-hover:opacity-100",
        className,
      )}
      {...props}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePlayPause}
        className="size-8"
      >
        {isPlaying ? <Pause /> : <Play />}
      </Button>

      <div className="whitespace-nowrap text-xs">
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>

      <div className="flex-grow">
        <Slider
          value={[currentTime]}
          min={0}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          className="w-full"
        />
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMute}
        className="size-8"
      >
        {isMuted ? <VolumeX /> : <Volume2 />}
      </Button>
    </div>
  );
}
