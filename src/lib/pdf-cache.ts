/**
 * Browser-side store for study-material PDFs, so each student downloads a
 * file once instead of on every open (mirrors the mobile app's pdf-cache).
 * Access is still checked server-side on every open before a cached copy is
 * shown; entries are scoped to the signed-in student and wiped on sign-out.
 * Every call is best effort: without Cache Storage (old browser, private
 * mode, plain http) the viewer just downloads as before.
 */
const CACHE_NAME = "study-materials-v1";
const PREFIX = "/__materials-cache/";

/** One entry per owner + material + storage path, so a replaced upload re-downloads. */
function keyFor(ownerId: string, id: string, storagePath: string): string {
  let h = 0;
  for (let i = 0; i < storagePath.length; i++) {
    h = (Math.imul(31, h) + storagePath.charCodeAt(i)) | 0;
  }
  return `${PREFIX}${ownerId}/${id}/${(h >>> 0).toString(36)}`;
}

function open(): Promise<Cache> | null {
  return typeof caches === "undefined" ? null : caches.open(CACHE_NAME);
}

/**
 * The PDF's bytes, from the cache or downloaded from `url` (then stored).
 * Also drops older versions of this material and other students' entries.
 */
export async function loadPdfBytes(
  url: string,
  ownerId: string,
  id: string,
  storagePath: string
): Promise<ArrayBuffer> {
  const key = keyFor(ownerId, id, storagePath);
  const cache = await open()?.catch(() => null);

  if (cache) {
    const hit = await cache.match(key).catch(() => undefined);
    if (hit) {
      try {
        return await hit.arrayBuffer();
      } catch {
        await cache.delete(key).catch(() => {});
      }
    }
  }

  const res = await fetch(url, { credentials: "same-origin" });
  if (!res.ok) throw new Error(`Download failed (${res.status})`);
  const bytes = await res.arrayBuffer();

  if (cache) {
    try {
      for (const req of await cache.keys()) {
        const path = new URL(req.url).pathname;
        const stale =
          !path.startsWith(`${PREFIX}${ownerId}/`) ||
          (path.startsWith(`${PREFIX}${ownerId}/${id}/`) && path !== key);
        if (stale) await cache.delete(req);
      }
      await cache.put(
        key,
        new Response(bytes.slice(0), {
          headers: { "Content-Type": "application/pdf" },
        })
      );
    } catch {
      // Quota exceeded or storage blocked: still show the PDF
    }
  }
  return bytes;
}

/** Sign-out: another student may use this browser next. */
export function clearPdfCache(): void {
  if (typeof caches === "undefined") return;
  caches.delete(CACHE_NAME).catch(() => {});
}
