// Shrinks big phone photos in the browser before upload. A 10 MB or 20 MB photo becomes about 300 to 800 KB.
// This keeps every upload request small, so it works behind Vercel's 4.5 MB request limit.
const SEND_LIMIT = 4 * 1024 * 1024; // never send more than this in one request
const GOOD_ENOUGH = 1.5 * 1024 * 1024;
const PASSES = [
  { max: 1800, quality: 0.85 },
  { max: 1600, quality: 0.75 },
  { max: 1280, quality: 0.7 },
  { max: 1024, quality: 0.65 },
];

async function loadBitmap(file) {
  if (window.createImageBitmap) {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      /* fall back to <img> */
    }
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('unreadable')); };
    img.src = url;
  });
}

const toBlob = (canvas, quality) => new Promise((res) => canvas.toBlob(res, 'image/jpeg', quality));

export async function compressImage(file) {
  if (!file.type?.startsWith('image/') || file.type === 'image/gif') return file;

  let bmp;
  try {
    bmp = await loadBitmap(file);
  } catch {
    if (file.size > SEND_LIMIT) throw new Error(`"${file.name}" is too large and this browser cannot resize it. Please use a JPG, PNG or WebP photo.`);
    return file;
  }

  const w0 = bmp.width || bmp.naturalWidth;
  const h0 = bmp.height || bmp.naturalHeight;
  if (Math.max(w0, h0) <= PASSES[0].max && file.size <= GOOD_ENOUGH) {
    bmp.close?.();
    return file;
  }

  let best = null;
  for (const { max, quality } of PASSES) {
    const scale = Math.min(1, max / Math.max(w0, h0));
    const w = Math.max(1, Math.round(w0 * scale));
    const h = Math.max(1, Math.round(h0 * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bmp, 0, 0, w, h);
    // eslint-disable-next-line no-await-in-loop
    const blob = await toBlob(canvas, quality);
    canvas.width = 0; // release memory
    if (blob && (!best || blob.size < best.size)) best = blob;
    if (best && best.size <= GOOD_ENOUGH) break;
  }
  bmp.close?.();

  if (!best || (best.size >= file.size && file.size <= SEND_LIMIT)) return file;
  if (best.size > SEND_LIMIT) throw new Error(`"${file.name}" could not be reduced enough to upload. Try a different photo.`);
  return new File([best], `${file.name.replace(/\.\w+$/, '')}.jpg`, { type: 'image/jpeg' });
}