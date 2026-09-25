import silkscreen from '@fontsource/silkscreen/files/silkscreen-latin-400-normal.woff2?url'
import fusion from '@fontsource/fusion-pixel-12px-proportional-sc/files/fusion-pixel-12px-proportional-sc-latin-400-normal.woff2?url'

function add(family: string, url: string) {
  const face = new FontFace(family, `url(${url}) format('woff2')`, { display: 'swap' })
  document.fonts.add(face)
  void face.load().catch(() => {})
}

/**
 * Only the woff2 files, registered from script so the 600 KB CJK face is never
 * requested by a site that turned it off.
 */
export function loadFonts(pixelCjk: boolean) {
  add('Silkscreen', silkscreen)
  if (pixelCjk) add('Fusion Pixel', fusion)
  document.documentElement.classList.toggle('system-font', !pixelCjk)
}
