export const ASCII_CONSTRAINTS = {
  OUTPUT_WIDTH: { MIN: 1, MAX: 300 },
  OUTPUT_HEIGHT: { MIN: 1, MAX: 300 },
  FONT_SIZE: { MIN: 1, MAX: 32 },
};
export const ASCII_CHAR_PRESETS = [
  { name: "Basic", value: "@%#*+=-:. " },
  {
    name: "Detailed",
    value:
      "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ",
  },
  { name: "Binary", value: "01" },
  { name: "Shades", value: "█▓▒░ " },
  { name: "Blocks", value: "█▇▆▅▄▃▂▁ " },
  { name: "Arrows", value: "→↗↑↖←↙↓↘ " },
];
export const ASCII_COLOUR_PRESETS = [
  "#FFFFFF",
  "#33FF00",
  "#FFB000",
  "#0099FF",
];

export interface AsciiConfig {
  outputWidth: number;
  outputHeight: number;
  chars: string;
  fontFamily: string;
  fontSize: number;
  colour: string;
  animate: boolean;
  contrast: number;
  brightness: number;
}
export const DEFAULT_ASCII_CONFIG: AsciiConfig = {
  outputWidth: 100,
  outputHeight: 75,
  chars: ASCII_CHAR_PRESETS[0].value,
  fontFamily: "monospace",
  fontSize: 14,
  colour: ASCII_COLOUR_PRESETS[1],
  animate: true,
  contrast: 1,
  brightness: 0,
};

function adjustPixel(
  value: number,
  contrast: number,
  brightness: number,
): number {
  // Apply contrast
  let adjusted = ((value / 255 - 0.5) * contrast + 0.5) * 255;
  // Apply brightness
  adjusted += brightness * 255;
  return Math.max(0, Math.min(255, adjusted));
}

export function generateAscii(data: ImageData, config: AsciiConfig) {
  const { outputWidth, outputHeight, chars, contrast, brightness } = config;
  const { width: sourceWidth, height: sourceHeight, data: pixels } = data;
  const ascii = new Array(outputHeight)
    .fill(null)
    .map(() => new Array(outputWidth).fill(" "));

  // Calculate how many source pixels correspond to one ASCII character
  const sampleWidth = sourceWidth / outputWidth;
  const sampleHeight = sourceHeight / outputHeight;

  // Reverse characters array so darker pixels map to later characters
  const charsArr = chars.split("").reverse();

  for (let row = 0; row < outputHeight; row++) {
    for (let col = 0; col < outputWidth; col++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let count = 0;

      // Stride length for pixel sampling within each character cell
      const step = Math.max(
        1,
        Math.floor(Math.min(sampleWidth, sampleHeight) / 4),
      );
      const x0 = Math.floor(col * sampleWidth);
      const y0 = Math.floor(row * sampleHeight);
      // Sample pixels within character cell
      for (let dy = 0; dy < sampleHeight; dy += step) {
        for (let dx = 0; dx < sampleWidth; dx += step) {
          const pixelX = Math.min(Math.floor(x0 + dx), sourceWidth - 1);
          const pixelY = Math.min(Math.floor(y0 + dy), sourceHeight - 1);

          const i = (pixelY * sourceWidth + pixelX) * 4;
          r += pixels[i];
          g += pixels[i + 1];
          b += pixels[i + 2];
          count++;
        }
      }

      if (count > 0) {
        r = adjustPixel(r / count, contrast, brightness);
        g = adjustPixel(g / count, contrast, brightness);
        b = adjustPixel(b / count, contrast, brightness);
      }

      // ITU-R BT.709 coefficients for perceived brightness
      const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const idx = Math.round((luminance / 255) * (chars.length - 1));
      ascii[row][col] = {
        char: charsArr[idx] ?? " ",
        colour:
          config.colour ||
          `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`,
      };
    }
  }

  return ascii;
}

export function renderAscii(
  source: HTMLCanvasElement,
  target: HTMLCanvasElement,
  config: AsciiConfig,
) {
  const sourceCtx = source.getContext("2d", { willReadFrequently: true });
  const targetCtx = target.getContext("2d");
  if (!sourceCtx || !targetCtx) return;

  const imageData = sourceCtx.getImageData(0, 0, source.width, source.height);
  const ascii = generateAscii(imageData, config);

  target.width = source.width;
  target.height = source.height;
  // Clear the target canvas
  targetCtx.fillStyle = "black";
  targetCtx.fillRect(0, 0, target.width, target.height);
  // Render the ASCII art
  targetCtx.fillStyle = config.colour;
  targetCtx.font = `${config.fontSize}px ${config.fontFamily}`;
  targetCtx.textBaseline = "top";
  const charWidth = target.width / config.outputWidth;
  const charHeight = target.height / config.outputHeight;
  for (let row = 0; row < ascii.length; row++) {
    for (let col = 0; col < ascii[row].length; col++) {
      const { char, colour } = ascii[row][col];
      targetCtx.fillStyle = colour;
      targetCtx.fillText(char, col * charWidth, row * charHeight);
    }
  }
}

export async function generateAsciiText(
  source: HTMLCanvasElement,
  config: AsciiConfig,
) {
  const ctx = source.getContext("2d");
  if (!ctx) return "";

  const imageData = ctx.getImageData(0, 0, source.width, source.height);
  const ascii = generateAscii(imageData, config);
  return ascii.map((row) => row.map((cell) => cell.char).join("")).join("\n");
}

// Record ASCII video from a source video element
export async function recordAscii(
  video: HTMLVideoElement,
  config: AsciiConfig,
  mimeType: "video/webm" | "video/mp4",
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const audioContext = new AudioContext();
    const audioSource = audioContext.createMediaElementSource(video);
    const audioDestination = audioContext.createMediaStreamDestination();
    audioSource.connect(audioDestination);
    audioSource.connect(audioContext.destination);

    // Create new canvases for rendering
    const videoCanvas = document.createElement("canvas");
    const asciiCanvas = document.createElement("canvas");
    videoCanvas.width = video.videoWidth;
    videoCanvas.height = video.videoHeight;
    asciiCanvas.width = videoCanvas.width;
    asciiCanvas.height = videoCanvas.height;

    // Set up stream with both audio and video
    const stream = new MediaStream();
    const canvasStream = asciiCanvas.captureStream();
    canvasStream.getTracks().forEach((track) => stream.addTrack(track));
    audioDestination.stream
      .getAudioTracks()
      .forEach((track) => stream.addTrack(track));

    const videoCtx = videoCanvas.getContext("2d", { willReadFrequently: true });
    const mediaRecorder = new MediaRecorder(stream, { mimeType });
    const chunks: Blob[] = [];
    let animationId: number;

    // Render loop
    let prevTime = 0;
    let hasFinished = false;
    function render() {
      if (video.currentTime < prevTime) hasFinished = true;
      prevTime = video.currentTime;

      if (!videoCtx || hasFinished || video.ended) {
        cancelAnimationFrame(animationId);
        mediaRecorder.stop();
        return;
      }

      videoCtx.drawImage(video, 0, 0);
      renderAscii(videoCanvas, asciiCanvas, config);
      animationId = requestAnimationFrame(render);
    }

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    mediaRecorder.onstop = () => {
      // Cleanup
      cancelAnimationFrame(animationId);
      stream.getTracks().forEach((track) => track.stop());
      audioSource.disconnect();
      audioContext.close();

      resolve(new Blob(chunks, { type: mimeType }));
    };

    // Start recording
    video.currentTime = 0;
    mediaRecorder.start();

    // Start playback and rendering
    video
      .play()
      .then(() => {
        animationId = requestAnimationFrame(render);
      })
      .catch((err) => {
        // Cleanup
        cancelAnimationFrame(animationId);
        mediaRecorder.stop();

        reject(err);
      });

    video.onerror = (err) => {
      // Cleanup
      cancelAnimationFrame(animationId);
      mediaRecorder.stop();

      reject(err);
    };
  });
}
