import { supabase } from "@/lib/supabaseServer";
import { unstable_noStore as noStore } from "next/cache";

// Returns a currently ongoing convention, if any
export async function getCurrentConvention() {
// Opt-out of static rendering and cache explicitly inside this function
  noStore();

  const now = new Date().toISOString();

  const { data: convention, error } = await supabase
    .from("conventions")
    .select("id, name, start_date, end_date, theme, logo_url, times, venue, address")
    .order("start_date", { ascending: true })
    .gt("end_date", new Date().toISOString())
    .lt("start_date", new Date().toISOString())
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching current convention:", error);
    return null;
  }

  return convention;
}