"use server"
import { supabase } from "@/lib/supabaseServer";

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
    
    console.log("conv", data);
    return data;
}