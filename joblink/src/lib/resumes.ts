/**
 * CVs live in the private "resumes" bucket at <user id>/resume-<timestamp>.<ext>.
 * We store that object path (not a URL) and mint short-lived signed links when a page renders.
 * Storage RLS decides who may sign: the owner, and employers the file was sent to.
 */
export const RESUME_BUCKET = "resumes";

/** How long a rendered CV link stays valid. Pages re-sign on every load. */
const SIGNED_URL_TTL = 60 * 60;

type StorageClient = {
  storage: {
    from: (bucket: string) => {
      createSignedUrls: (paths: string[], expiresIn: number) => Promise<{ data: { path: string | null; signedUrl: string | null }[] | null; error: unknown }>;
    };
  };
};

/**
 * The bucket object path for a stored CV value. Accepts plain paths and the
 * public URLs saved before the bucket went private. Anything else (e.g. mock
 * files under /mock) isn't in storage and returns null.
 */
export function resumePath(value: string | null | undefined) {
  const raw = (value ?? "").trim();
  if (!raw) return null;
  const legacy = raw.match(/\/storage\/v1\/object\/(?:public|sign)\/resumes\/([^?#]+)/);
  const path = legacy ? decodeURIComponent(legacy[1]) : raw;
  return /^[0-9a-f-]{36}\/[^/]+$/i.test(path) ? path : null;
}

/** True when `value` points at a file inside this user's own CV folder. */
export function ownsResume(value: string, userId: string) {
  return resumePath(value)?.startsWith(`${userId}/`) ?? false;
}

/**
 * Signed, viewable links for stored CV values, keyed by the original value.
 * Non-storage values pass through unchanged; files the viewer can't access are left out.
 */
export async function signResumes(supabase: StorageClient, values: (string | null | undefined)[]) {
  const links = new Map<string, string>();
  const paths = new Map<string, string>();
  for (const value of values) {
    if (!value) continue;
    const path = resumePath(value);
    if (path) paths.set(path, value);
    else links.set(value, value);
  }
  if (!paths.size) return links;

  const { data, error } = await supabase.storage.from(RESUME_BUCKET).createSignedUrls([...paths.keys()], SIGNED_URL_TTL);
  if (error) console.warn("Could not sign CV links:", error);
  for (const item of data ?? []) {
    const original = item.path ? paths.get(item.path) : undefined;
    if (original && item.signedUrl) links.set(original, item.signedUrl);
  }
  return links;
}

/** Signed link for one stored CV value, or null if there's nothing viewable. */
export async function signResume(supabase: StorageClient, value: string | null | undefined) {
  if (!value) return null;
  return (await signResumes(supabase, [value])).get(value) ?? null;
}
