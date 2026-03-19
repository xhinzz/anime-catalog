import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;

// Server-side client (with service key for storage operations)
export const supabase = createClient(supabaseUrl, supabaseKey);

// Get public URL for a file in storage
export function getStorageUrl(bucket: string, path: string) {
  if (!path) return null;
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}
