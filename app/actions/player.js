"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { supabase } from "@/lib/supabaseServer";
import { requestFreshTargetAssignment } from "./target";
import { approvalStatuses } from "@/lib/constants";

// Save player data
export async function createPlayer(conventionId, formData) {
    const reqId = Math.random().toString(36).substring(2, 9);
    const errorStyle = "color: #ef4444; font-weight: bold; background: #450a0a; padding: 2px 6px; border-radius: 4px;";

    const name = formData.get("name");
    const contact = formData.get("contact");
    const description = formData.get("description");
    const invisible = formData.get("invisible") === "true";
    const character = formData.get("character");
    const series = formData.get("series");
    const photo = formData.get("photo");

    // Validation
    if (!name) {
        console.error(`%c[createPlayer:${reqId}] Validation Failed: 'name' is missing`, errorStyle);
        throw new Error("Please fill in all required fields.");
    }
    if (!!name && name === null) {
        console.error(`%c[createPlayer:${reqId}] Validation Failed: 'name' is explicit null string`, errorStyle);
        throw new Error("The entered name cannot be processed, please change it");
    }
    if (!!contact && contact === null) {
        console.error(`%c[createPlayer:${reqId}] Validation Failed: 'contact' is explicit null string`, errorStyle);
        throw new Error("The entered contact cannot be processed, please change it, or leave it blank");
    }
    if (!!description && description === null) {
        console.error(`%c[createPlayer:${reqId}] Validation Failed: 'description' is explicit null string`, errorStyle);
        throw new Error("The entered description be processed, please change it, or leave it blank");
    }
    if (!invisible && (!(photo instanceof File) || !(character) && !(series))) {
        console.error(`%c[createPlayer:${reqId}] Validation Failed: Visible player missing photo or character/series`, errorStyle, {
            isPhotoFile: photo instanceof File,
            character,
            series
        });
        throw new Error("Please fill in all required fields.");
    }
    if (!invisible && character === null) {
        console.error(`%c[createPlayer:${reqId}] Validation Failed: 'character' is explicit null string`, errorStyle);
        throw new Error("The entered character name cannot be processed, please change it");
    }
    if (!invisible && series === null) {
        console.error(`%c[createPlayer:${reqId}] Validation Failed: 'series' is explicit null string`, errorStyle);
        throw new Error("The entered series name cannot be processed, please change it");
    }

    const appUid = randomUUID();
    let photoPath = null;

    // Upload photo
    if (!invisible && photo instanceof File) {
        const uploadStartTime = performance.now();

        const extension = photo.name.split(".").pop()?.toLowerCase() || "jpg";
        photoPath = `${appUid}.${extension}`;

        const arrayBuffer = await photo.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { error: uploadError } = await supabase.storage
            .from("hunter-photos")
            .upload(photoPath, buffer, {
                contentType: photo.type,
                cacheControl: "3600",
                upsert: false,
            });

        const uploadDuration = (performance.now() - uploadStartTime).toFixed(2);

        if (uploadError) {
            console.error(`%c[createPlayer:${reqId}] Photo Upload Failed (${uploadDuration}ms):`, errorStyle, uploadError);
            throw new Error("Could not upload photo.");
        }
    }

    const newRow = {
        convention_id: conventionId,
        app_uid: appUid,
        code: String(Math.ceil(Math.random() * 9999)).padStart(4, "0"),
        targets: "",
        created_at: new Date().toISOString(),
        name: name.toString().trim() || "",
        contact: contact?.toString().trim() || "",
        character: character?.toString().trim() || "",
        series: series?.toString().trim() || "",
        description: description?.toString().trim() || "",
        invisible,
        image_url: photoPath,
    };

    const dbStartTime = performance.now();

    const { error } = await supabase.from("players").insert(newRow);
    const dbDuration = (performance.now() - dbStartTime).toFixed(2);

    if (error) {
        console.error(`%c[createPlayer:${reqId}] DB Insert Failed (${dbDuration}ms):`, errorStyle, error);

        if (photoPath) {
            const { error: removeError } = await supabase.storage
                .from("hunter-photos")
                .remove([photoPath]);

            if (removeError) console.error(`%c[createPlayer:${reqId}] Rollback failed:`, errorStyle, removeError);
        }
        throw new Error("Could not create your player.");
    }

    // Set persistent cookie
    const cookieStore = await cookies();

    cookieStore.set("hunter_app_uid", appUid, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
    });

    // Initial target assignment
    const freshAssignmentResult = await requestFreshTargetAssignment(conventionId, appUid);

    const assignedTargets = Array.isArray(freshAssignmentResult)
        ? freshAssignmentResult
        : freshAssignmentResult?.targets || freshAssignmentResult?.data || [];

    // Send the player directly to their page.
    redirect(`/c/${conventionId}/player/${appUid}`);
}

// Update player data
export async function updatePlayerLastRefresh(playerUid, status) {
    const { data, error } = await supabase
        .from("players")
        .update({ last_refresh: status })
        .eq("app_uid", playerUid)
        .select();

    if (error) {
        console.error("%c[DB] Supabase update failed:", "color: #ef4444; font-weight: bold;", error);
        throw new Error(error.message);
    }

    return data;
}

export async function updatePlayerApproval(playerUid, status) {
    const { data, error } = await supabase
        .from("players")
        .update({ approved: status })
        .eq("id", playerUid)
        .select();

    if (error) throw new Error(error.message);
    return data;
}

export async function updatePlayerVisibility(playerUid, status) {
    const { data, error } = await supabase
        .from("players")
        .update({ invisible: status })
        .eq("id", playerUid)
        .select();

    if (error) throw new Error(error.message);
    return data;
}

// Remove player data
export async function removePlayerPhoto(playerUid) {
  const { data, error } = await supabase
    .from("players")
    .update({ image_url: null })
    .eq("id", playerUid)
    .select();

  if (error) throw new Error(error.message);
  return data;
}

// Load player data
export async function loadPlayers(conventionId) {
    const { data: players, error } = await supabase
        .from("players")
        .select("*")
        .eq("convention_id", conventionId);

    if (error) {
        console.error("Supabase Query Error:", error);
    }

    return players;
}

export async function loadPlayerFromUid(playerUid) {
    const { data: player, error } = await supabase
        .from("players")
        .select("*")
        .in("app_uid", playerUid);

    if (error) {
        console.error("Supabase Query Error:", error);
    }

    return player;
}

export async function loadPlayerLists(conventionId) {
    return await Promise.all([
        supabase.from("players").select("*").eq("convention_id", conventionId).eq("approved", approvalStatuses.PENDING).order("created_at", { ascending: false }),
        supabase.from("players").select("*").eq("convention_id", conventionId).order("invisible", { ascending: true }).order("created_at", { ascending: false }),
        supabase.from("players").select("*").eq("convention_id", conventionId).eq("approved", approvalStatuses.APPROVED).order("score", { ascending: false }),
    ]);
}