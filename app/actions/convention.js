"use server"
import { supabase } from "@/lib/supabaseServer";
import { approvalStatuses } from "@/lib/constants";

export async function loadConventions() {

    const { data, error } = await supabase
        .from("conventions")
        .select("id, name, start_date, end_date")
        .order("start_date", { ascending: true });
    return data;
}

export async function loadConvention(conventionId) 
{    
    const { data, error } = await supabase
        .from("conventions")
        .select("*")
        .eq("id", conventionId);
    if (!data || data?.length === 0) return 
    
    return data[0];
}

export async function getConventionPlayerLists(conventionId) {
    return await Promise.all([
          supabase.from("players").select("*").eq("convention_id", conventionId).eq("approved", approvalStatuses.APPROVED).order("score", { ascending: false }),
          supabase.from("players").select("*").eq("convention_id", conventionId).order("created_at", { ascending: false }),
          supabase.from("players").select("*").eq("convention_id", conventionId).eq("approved", approvalStatuses.PENDING).order("created_at", { ascending: false }),
    ]);
}