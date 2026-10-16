"use server"
import { supabase } from "@/lib/supabaseServer";

export async function loadConventions() {

    const { data, error } = await supabase
        .from("conventions")
        .select("id, name, start_date, end_date")
        .order("start_date", { ascending: true });
    return data;
}

export async function getCurrentConvention() {
  const now = new Date().toISOString();

  const { data: convention, error } = await supabase
    .from("conventions")
    .select("*")
    .order("start_date", { ascending: true })
    .gt("end_date", now)
    .lt("start_date", now)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("❌ [getCurrentConvention] Error fetching current convention:", error);
    return null;
  }

  return convention;
}

export async function loadConvention(conventionId) {
    const { data, error } = await supabase
        .from("conventions")
        .select("*")
        .eq("id", conventionId);
    if (!data || data?.length === 0) return

    return data[0];
}