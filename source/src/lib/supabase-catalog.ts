import { supabase } from "./supabase";

export type CatalogGame = {
  id: string;
  name: string;
  cat: string;
  icon: string;
  grad: string;
  rating: number;
  desc: string;
  instructions?: string;
  image?: string;
  externalUrl?: string;
  sourceHtml?: string;
  featured?: boolean;
  isHidden?: boolean;
};

export type CatalogApp = {
  id: string;
  name: string;
  cat: string;
  icon: string;
  grad: string;
  rating: number;
  image?: string;
  externalUrl?: string;
  downloadUrl?: string;
  description: string;
  featured?: boolean;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  storageBucket?: string;
  storagePath?: string;
  isHidden?: boolean;
};

export type CatalogTheme = {
  id: string;
  name: string;
  icon: string;
  bg: string;
  price: number;
  description: string;
  image?: string;
  featured?: boolean;
};

export type CatalogKind = "game" | "app" | "theme";

export type StoreCatalog = {
  games: CatalogGame[];
  apps: CatalogApp[];
  themes: CatalogTheme[];
  hiddenItems: Array<{ catalogKind: CatalogKind; itemId: string }>;
};

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }
  return supabase;
}

function throwIfError(error: { message: string; code?: string } | null) {
  if (error) throw new Error(error.message);
}

export async function fetchStoreCatalog(): Promise<StoreCatalog> {
  const client = requireSupabase();
  const [gamesResult, appsResult, themesResult, hiddenResult] = await Promise.all([
    client.from("store_games").select("*").order("created_at"),
    client.from("store_apps").select("*").order("created_at"),
    client.from("store_themes").select("*").order("created_at"),
    client.from("store_hidden_items").select("catalog_kind,item_id"),
  ]);
  throwIfError(gamesResult.error);
  throwIfError(appsResult.error);
  throwIfError(themesResult.error);
  const hiddenTableUnavailable = hiddenResult.error?.code === "PGRST205" || hiddenResult.error?.code === "42P01";
  if (hiddenResult.error && hiddenTableUnavailable) {
    console.warn("store_hidden_items is not installed yet; built-in catalog hiding is unavailable.");
  } else {
    throwIfError(hiddenResult.error);
  }

  return {
    games: (gamesResult.data || []).map((row) => ({
      id: row.id,
      name: row.name,
      cat: row.category,
      icon: row.icon,
      grad: row.gradient,
      rating: Number(row.rating),
      desc: row.description,
      instructions: row.instructions,
      image: row.image_url || undefined,
      externalUrl: row.external_url || undefined,
      sourceHtml: row.source_html || undefined,
      featured: row.featured,
      isHidden: row.is_hidden,
    })),
    apps: (appsResult.data || []).map((row) => {
      const fileUrl = row.storage_bucket && row.storage_path
        ? client.storage.from(row.storage_bucket).getPublicUrl(row.storage_path).data.publicUrl
        : undefined;
      return {
        id: row.id,
        name: row.name,
        cat: row.category,
        icon: row.icon,
        grad: row.gradient,
        rating: Number(row.rating),
        description: row.description,
        image: row.image_url || undefined,
        externalUrl: row.external_url || fileUrl,
        downloadUrl: row.download_url || fileUrl,
        featured: row.featured,
        fileName: row.file_name || undefined,
        fileType: row.file_type || undefined,
        fileSize: row.file_size === null ? undefined : Number(row.file_size),
        storageBucket: row.storage_bucket || undefined,
        storagePath: row.storage_path || undefined,
        isHidden: row.is_hidden,
      };
    }),
    themes: (themesResult.data || []).map((row) => ({
      id: row.id,
      name: row.name,
      icon: row.icon,
      bg: row.background,
      price: row.price,
      description: row.description,
      image: row.image_url || undefined,
      featured: row.featured,
    })),
    hiddenItems: (hiddenTableUnavailable ? [] : hiddenResult.data || []).map((row) => ({
      catalogKind: row.catalog_kind as CatalogKind,
      itemId: row.item_id,
    })),
  };
}

export async function saveCatalogGame(game: CatalogGame) {
  const client = requireSupabase();
  const { error } = await client.from("store_games").upsert({
    id: game.id,
    name: game.name,
    category: game.cat,
    icon: game.icon,
    gradient: game.grad,
    rating: game.rating,
    description: game.desc,
    instructions: game.instructions || "",
    image_url: game.image || null,
    external_url: game.externalUrl || null,
    source_html: game.sourceHtml || null,
    featured: Boolean(game.featured),
    is_hidden: Boolean(game.isHidden),
    updated_at: new Date().toISOString(),
  }, { onConflict: "id" });
  throwIfError(error);
}

export async function saveCatalogApp(app: CatalogApp) {
  const client = requireSupabase();
  const { error } = await client.from("store_apps").upsert({
    id: app.id,
    name: app.name,
    category: app.cat,
    icon: app.icon,
    gradient: app.grad,
    rating: app.rating,
    description: app.description,
    image_url: app.image || null,
    external_url: app.externalUrl || null,
    download_url: app.downloadUrl || null,
    storage_bucket: app.storageBucket || null,
    storage_path: app.storagePath || null,
    file_name: app.fileName || null,
    file_type: app.fileType || null,
    file_size: app.fileSize ?? null,
    featured: Boolean(app.featured),
    is_hidden: Boolean(app.isHidden),
    updated_at: new Date().toISOString(),
  }, { onConflict: "id" });
  throwIfError(error);
}

export async function saveCatalogTheme(theme: CatalogTheme) {
  const client = requireSupabase();
  const { error } = await client.from("store_themes").upsert({
    id: theme.id,
    name: theme.name,
    icon: theme.icon,
    background: theme.bg,
    price: theme.price,
    description: theme.description,
    image_url: theme.image || null,
    featured: Boolean(theme.featured),
    updated_at: new Date().toISOString(),
  }, { onConflict: "id" });
  throwIfError(error);
}

export async function hideCatalogItem(kind: CatalogKind, id: string) {
  const client = requireSupabase();
  const { error } = await client.from("store_hidden_items").upsert({
    catalog_kind: kind,
    item_id: id,
  }, { onConflict: "catalog_kind,item_id" });
  throwIfError(error);
}

export async function showCatalogItem(kind: CatalogKind, id: string) {
  const client = requireSupabase();
  const { error } = await client.from("store_hidden_items")
    .delete()
    .eq("catalog_kind", kind)
    .eq("item_id", id);
  if (error?.code === "PGRST205" || error?.code === "42P01") {
    console.warn("store_hidden_items is not installed yet; no hidden marker was removed.");
    return;
  }
  throwIfError(error);
}

export async function deleteCatalogGame(id: string) {
  const client = requireSupabase();
  const { error } = await client.from("store_games").delete().eq("id", id);
  throwIfError(error);
}

export async function deleteCatalogApp(id: string) {
  const client = requireSupabase();
  const { error } = await client.from("store_apps").delete().eq("id", id);
  throwIfError(error);
}

export async function deleteCatalogTheme(id: string) {
  const client = requireSupabase();
  const { error } = await client.from("store_themes").delete().eq("id", id);
  throwIfError(error);
}

export async function deleteCatalogStorageFile(bucket: string, path: string) {
  const client = requireSupabase();
  const { error } = await client.storage.from(bucket).remove([path]);
  throwIfError(error);
}
