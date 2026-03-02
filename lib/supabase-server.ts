import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function createServerSupabaseClient() {
  const { getToken } = await auth();
  const supabaseToken = await getToken({ template: "supabase" }).catch(() => null);

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: supabaseToken
        ? { Authorization: `Bearer ${supabaseToken}` }
        : {},
    },
  });
}
