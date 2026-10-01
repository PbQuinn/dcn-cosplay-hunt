"use server";

import { randomUUID } from "crypto";
import { supabase } from "@/lib/supabaseServer";
import { requestFreshTargetAssignment } from "./target";
import { landPlayer } from "../landPlayer";
import { generateSeededRecoveryCode } from "@/lib/seededGeneration";

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

    // Generate player appUid
    const appUid = randomUUID();

    // Generate unique 10-digit recovery code seeded from appUid
    const recoveryCode = generateSeededRecoveryCode(appUid);

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
        recovery_code: recoveryCode,
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

    // Initial target assignment
    const freshAssignmentResult = await requestFreshTargetAssignment(conventionId, appUid);

    const assignedTargets = Array.isArray(freshAssignmentResult)
        ? freshAssignmentResult
        : freshAssignmentResult?.targets || freshAssignmentResult?.data || [];

    // Perform landing operations on new player
    await landPlayer(conventionId, appUid)
}

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

// Load player UID from recovery code
export async function loadPlayerFromRecovery(recoveryCode) {
    const { data: player, error } = await supabase
        .from("players")
        .select("app_uid")
        .eq("recovery_code", recoveryCode)
        .single();

    if (error) {
        console.error("Supabase Query Error:", error);
    }

    return player.app_uid;
}

