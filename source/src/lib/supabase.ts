import { createClient, type Session } from "@supabase/supabase-js";
import { validateArenaArchive } from "./arenaArchive";

export { validateArenaArchive } from "./arenaArchive";

const rawUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const projectUrl = rawUrl?.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");

export const supabaseConfigured = Boolean(
  projectUrl &&
    rawAnonKey &&
    !projectUrl.includes("your-project-id") &&
    !rawAnonKey.includes("your-anon-key")
);

export const supabase = supabaseConfigured
  ? createClient(projectUrl!, rawAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function getSupabaseStatusText() {
  if (!supabaseConfigured) return "Supabase is not configured yet. Add your URL and anon key in source/.env.local.";
  return "Supabase is configured for secure admin access.";
}

export async function getSupabaseSession(): Promise<Session | null> {
  if (!supabase) return null;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export async function signInToAdmin(email: string, password: string) {
  if (!supabase) {
    throw new Error("Supabase is not configured. Add the project URL and anon key from your Supabase dashboard.");
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  const { data: isAdmin, error: authorizationError } = await supabase.rpc("is_store_admin");
  if (authorizationError || isAdmin !== true) {
    await supabase.auth.signOut();
    throw new Error("This account is not approved for store administration.");
  }
  return data.session;
}

export async function isCurrentUserStoreAdmin() {
  if (!supabase) return false;
  const { data: isAdmin, error } = await supabase.rpc("is_store_admin");
  if (error) throw error;
  return isAdmin === true;
}

export async function signOutAdmin() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export const arenaBucketName = (import.meta.env.VITE_SUPABASE_ARENA_BUCKET as string | undefined) || "arena-zips";

function sanitizeStorageName(name: string) {
  return name
    .replace(/\\/g, "/")
    .split("/")
    .filter(Boolean)
    .map((part) => part.replace(/[^a-zA-Z0-9._-]+/g, "-"))
    .join("-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "upload";
}

export function validateArenaUpload(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase();
  const allowed = ["zip", "apk", "png", "jpg", "jpeg", "webp", "gif"];

  if (!ext || !allowed.includes(ext)) {
    return { ok: false, reason: "Unsupported file type. Allowed: ZIP, APK, PNG, JPG, WEBP, GIF." };
  }

  if (file.size === 0) {
    return { ok: false, reason: "Empty files are not allowed." };
  }

  const maxBytes = 250 * 1024 * 1024;
  if (file.size > maxBytes) {
    return { ok: false, reason: "File is too large. Maximum size is 250 MB." };
  }

  return { ok: true };
}

export async function uploadArenaPackage(file: File, title: string, description: string) {
  if (!supabase) {
    throw new Error("Supabase is not configured. Add the project URL and anon key from your Supabase dashboard.");
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError || !session) {
    throw new Error("Admin sign-in required before uploading to the Arena bucket.");
  }

  const validation = validateArenaUpload(file);
  if (!validation.ok) throw new Error(validation.reason);

  await validateArenaArchive(file);

  const safeTitle = title.trim() || file.name.replace(/\.[^.]+$/, "");
  const safeDescription = description.trim() || "Arena upload";
  const objectName = `${Date.now()}-${sanitizeStorageName(safeTitle).toLowerCase()}-${sanitizeStorageName(file.name)}`;
  const filePath = objectName;

  const { data, error } = await supabase.storage.from(arenaBucketName).upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || "application/octet-stream",
  });

  if (error) throw error;

  return {
    id: data?.path || filePath,
    title: safeTitle,
    description: safeDescription,
    filePath,
    bucket: arenaBucketName,
    publicUrl: supabase.storage.from(arenaBucketName).getPublicUrl(filePath).data.publicUrl,
  };
}
