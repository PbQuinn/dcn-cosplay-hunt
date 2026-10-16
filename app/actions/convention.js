"use server"
import { supabase } from "@/lib/supabaseServer";
import { randomUUID } from "crypto";
import { removeCaptures } from "./target";
import { removePlayers } from "./player";

// Create convention data
export async function createConvention(formData) {
    // Console styling
    const reqId = Math.random().toString(36).substring(2, 9);
    const errorStyle = "color: #ef4444; font-weight: bold; background: #450a0a; padding: 2px 6px; border-radius: 4px;";

    // Required fields
    const name = formData.get("name");
    const start_date = formData.get("start_date");
    const end_date = formData.get("end_date");

    // Optional fields
    const theme = formData.get("theme");
    const venue = formData.get("venue");
    const address = formData.get("address");
    const stand_location = formData.get("stand_location");
    const logo = formData.get("logo");

    const conventionId = randomUUID();
    let logoPath = null;

    // Upload logo
    if (logo instanceof File) {
        const uploadStartTime = performance.now();

        const extension = logo.name.split(".").pop()?.toLowerCase() || "jpg";
        logoPath = `${conventionId}.${extension}`;

        const arrayBuffer = await logo.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { error: uploadError } = await supabase.storage
            .from("convention-logos")
            .upload(logoPath, buffer, {
                contentType: logo.type,
                cacheControl: "3600",
                upsert: false,
            });

        const uploadDuration = (performance.now() - uploadStartTime).toFixed(2);

        if (uploadError) {
            console.error(`%c[createConvention:${reqId}] Photo Upload Failed (${uploadDuration}ms):`, errorStyle, uploadError);
            throw new Error("Could not upload photo.");
        }
    }

    const newRow = {
        id: conventionId,
        name: name.toString().trim() || "",
        theme: theme.toString().trim() || "",
        logo_url: logoPath,
        start_date,
        end_date,
        created_at: new Date().toISOString(),
        venue: venue.toString().trim() || "",
        address: address.toString().trim() || "",
        stand_location: stand_location.toString().trim() || "",
    };

    const dbStartTime = performance.now();

    const { error } = await supabase.from("conventions").insert(newRow);
    const dbDuration = (performance.now() - dbStartTime).toFixed(2);

    if (error) {
        console.error(`%c[createConvention:${reqId}] DB Insert Failed (${dbDuration}ms):`, errorStyle, error);
        throw new Error("Could not create convention.");
    }
}

// Update convention data

// Remove convention data
export async function removeConventionLogo(conventionId) {
    const convention = await loadConvention(conventionId);
    if (!convention || !convention.logo_url) return;

    const { error } = await supabase.storage
        .from("convention-logos")
        .remove([convention.logo_url]);

    if (error) {
        console.error("Failed to delete convention logo from storage:", error.message);
    }
    return error;
}

export async function removeConvention(conventionId) {
    // 0. Remove convention logo from storage first
    await removeConventionLogo(conventionId);

    // 1. Delete related captures first (foreign key dependency)
    const capturesError = await removeCaptures(conventionId);
    if (capturesError) {
        console.error("Failed to delete related captures:", capturesError.message || capturesError);
        return capturesError;
    }

    // 2. Delete related players next (which also clears player photos)
    const playersError = await removePlayers(conventionId);
    if (playersError) {
        console.error("Failed to delete related players:", playersError.message || playersError);
        return playersError;
    }

    // 3. Finally, delete the convention itself from the database
    const { error } = await supabase
        .from("conventions")
        .delete()
        .eq("id", conventionId);

    if (error) {
        console.error("Failed to delete convention:", error.message);
    }
    return error;
}

// Load convention data
export async function loadConventions() {

    const { data, error } = await supabase
        .from("conventions")
        .select("id, name, start_date, end_date")
        .order("start_date", { ascending: true });
    return data;
}

export async function loadConvention(conventionId) {
    const { data, error } = await supabase
        .from("conventions")
        .select("*")
        .eq("id", conventionId);
    if (!data || data?.length === 0) return

    return data[0];
}