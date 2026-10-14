"use server"
import { supabase } from "@/lib/supabaseServer";
import { randomUUID } from "crypto";

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
    const icon = formData.get("icon");

    const conventionId = randomUUID();
    let iconPath = null;

    // Upload icon
    if (icon instanceof File) {
        const uploadStartTime = performance.now();

        const extension = icon.name.split(".").pop()?.toLowerCase() || "jpg";
        iconPath = `${conventionId}.${extension}`;

        const arrayBuffer = await icon.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { error: uploadError } = await supabase.storage
            .from("convention-logos")
            .upload(iconPath, buffer, {
                contentType: icon.type,
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
        logo_url: iconPath,
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
export async function deleteConvention(conventionId) {
    const { error } = await supabase
        .from("conventions")
        .delete()
        .eq("id", conventionId);

    if (error) {
        console.error("Failed to delete convention:", error.message);
    }
    return error
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