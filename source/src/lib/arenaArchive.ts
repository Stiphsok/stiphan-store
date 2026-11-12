import JSZip from "jszip";

const ZIP_DANGEROUS_SUFFIXES = [
  ".exe",
  ".dll",
  ".so",
  ".dylib",
  ".com",
  ".msi",
  ".bat",
  ".cmd",
  ".ps1",
  ".sh",
  ".php",
  ".phtml",
  ".asp",
  ".aspx",
  ".jsp",
  ".jspx",
  ".cgi",
  ".pl",
  ".py",
  ".rb",
  ".jar",
  ".class",
];

const ALLOWED_WEB_ASSET_SUFFIXES = new Set([
  ".html",
  ".htm",
  ".css",
  ".js",
  ".mjs",
  ".json",
  ".map",
  ".txt",
  ".xml",
  ".webmanifest",
  ".wasm",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".avif",
  ".svg",
  ".ico",
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
  ".mp3",
  ".ogg",
  ".wav",
  ".mp4",
  ".webm",
]);

const MAX_ARCHIVE_ENTRIES = 500;
const MAX_ARCHIVE_FILE_BYTES = 25 * 1024 * 1024;
const MAX_ARCHIVE_TOTAL_BYTES = 100 * 1024 * 1024;
const MAX_ARCHIVE_COMPRESSION_RATIO = 100;

type ArchiveEntryMetadata = {
  unsafeOriginalName?: string;
  unixPermissions?: number | string;
  _data?: { compressedSize?: number; uncompressedSize?: number } | null;
};

function isUnsafeArchivePath(path: string) {
  const normalized = path.replace(/\\/g, "/");
  return (
    !normalized ||
    normalized.startsWith("/") ||
    /^[a-zA-Z]:/.test(normalized) ||
    normalized.split("/").some((part) => part === ".." || part === ".") ||
    normalized.includes("\0")
  );
}

export async function validateArenaArchive(file: File) {
  if (!file.name.toLowerCase().endsWith(".zip")) return;

  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const entries = Object.entries(zip.files);
  if (entries.length > MAX_ARCHIVE_ENTRIES) {
    throw new Error(`Archive contains too many entries (maximum ${MAX_ARCHIVE_ENTRIES}).`);
  }

  let totalUncompressedBytes = 0;
  let hasRootIndex = false;

  for (const [entryName, entry] of entries) {
    const metadata = entry as typeof entry & ArchiveEntryMetadata;
    const originalName = metadata.unsafeOriginalName || entryName;
    if (isUnsafeArchivePath(originalName)) {
      throw new Error("Archive contains an unsafe path.");
    }

    const lowerName = originalName.toLowerCase();
    if (ZIP_DANGEROUS_SUFFIXES.some((suffix) => lowerName.endsWith(suffix))) {
      throw new Error(`Archive contains a prohibited server executable: ${originalName}`);
    }

    if (!entry.dir) {
      const extension = lowerName.slice(lowerName.lastIndexOf("."));
      if (!ALLOWED_WEB_ASSET_SUFFIXES.has(extension)) {
        throw new Error(`Unsupported Arena web asset: ${originalName}`);
      }
    }

    const permissions = Number(metadata.unixPermissions) || 0;
    if ((permissions & 0xf000) === 0xa000) {
      throw new Error("Archive symlinks are not allowed.");
    }

    if (entry.dir) continue;

    const uncompressedSize = metadata._data?.uncompressedSize;
    const compressedSize = metadata._data?.compressedSize;
    if (typeof uncompressedSize !== "number" || typeof compressedSize !== "number") {
      throw new Error("Archive entry sizes could not be verified.");
    }
    if (uncompressedSize > MAX_ARCHIVE_FILE_BYTES) {
      throw new Error(`Archive entry is too large: ${originalName}`);
    }

    totalUncompressedBytes += uncompressedSize;
    if (totalUncompressedBytes > MAX_ARCHIVE_TOTAL_BYTES) {
      throw new Error("Archive expands beyond the 100 MB safety limit.");
    }
    if (uncompressedSize > 0 && uncompressedSize / Math.max(compressedSize, 1) > MAX_ARCHIVE_COMPRESSION_RATIO) {
      throw new Error(`Suspicious compression ratio in archive entry: ${originalName}`);
    }

    if (lowerName === "index.html") hasRootIndex = true;
  }

  if (!hasRootIndex) {
    throw new Error("Arena game ZIP must contain an index.html file at its root.");
  }
}