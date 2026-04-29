Drop your 500 frame images in this folder.

Naming (zero-padded, 3 digits):
  frame001.png
  frame002.png
  frame003.png
  ...
  frame499.png
  frame500.png

The hero animation in `src/components/FrameAnimation.jsx` reads them from
`/frames/frame001.png` … `/frames/frame500.png` at runtime.

Tips:
  - PNG with transparent or white background works best (`object-contain`).
  - All frames should share the same dimensions so the canvas doesn't reflow.
  - Aim for ~720–1080 px on the long edge; 500 frames at that size loads
    quickly on broadband and keeps memory < ~150 MB.

Need a different count, extension, or padding? Pass props to FrameAnimation:
  <FrameAnimation totalFrames={240} extension="webp" padding={4} />

Quick rename script (run in this folder if your frames are e.g. `0.png`..`499.png`):
  bash:
    i=1; for f in $(ls *.png | sort -V); do
      mv "$f" "$(printf 'frame%03d.png' "$i")"; i=$((i+1));
    done
