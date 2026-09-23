"use server";

import { approvalStatuses, CAPTURE_REWARD, NR_TARGETS } from "@/lib/constants";
import { supabase } from "@/lib/supabaseServer";
import { stringFromTargetList, targetListFromString } from "@/lib/targetList";

// Load capture data
export async function loadCaptures(conventionId) {
  const { data: captures, error } = await supabase
    .from("captures")
    .select("*")
    .eq("convention_id", conventionId);

  if (error) {
    console.error("Supabase Query Error:", error);
  }

  return captures;
}

export async function updatePlayerApproval(target, status) {
  const { data, error } = await supabase
    .from("players")
    .update({ approved: status })
    .eq("id", target.id)
    .select();

  if (error) throw new Error(error.message);
  return data;
}

/* Get the UID of a random fellow hunter */
export async function getNewTarget(conventionId, hunterId, currentTargets) {
  // TODO: Implement query that only considers records that are:
  // * not already in the logged captures
  // * not already in the target list of the current hunter
  const captures = await getHunterCaptureIds(conventionId, hunterId)

  if (captures.error) {
    console.error(captures.error)
    // Empty target but nonempty error indicates something went wrong on the backend side
    return { newTarget: undefined, error: captures.error }
  }

  const forbiddenTargets = currentTargets.concat(captures.targets)

  /* Select all hunters not equal to the requesting hunter */
  const { data: candidateTargetIds, findError } = await supabase
    .from("players")
    .select("app_uid")
    .eq("convention_id", conventionId)
    .eq("invisible", false)
    .eq("approved", approvalStatuses.APPROVED)
    .notIn("app_uid", forbiddenTargets)
    .neq("app_uid", hunterId);

  if (findError) {
    // Empty target but nonempty error indicates something went wrong on the backend side
    return { newTarget: undefined, error: findError }
  }

  let candidates = candidateTargetIds ? candidateTargetIds : [];
  let index = Math.floor(Math.random() * candidates.length)
  let target = candidates[index];
  // If there is a target, return it. Otherwise return empty with no error, indicating "No targets left"
  return target ? { newTarget: target.app_uid, error: undefined } : { newTarget: undefined, error: undefined }
}


/* Get the hunters current target list */
export async function getHunterTargetIds(conventionId, hunterId) {
  return new Promise(async (resolve) => {
    /* Select all hunters not equal to the requesting hunter */
    let { data: hunterLine, error } = await supabase
      .from("players")
      .select("*")
      .eq("convention_id", conventionId)
      .eq("app_uid", hunterId)

    if (hunterLine.length > 0) {
      hunterLine = hunterLine[0]
    }
    resolve(targetListFromString(hunterLine?.targets))
  })
}
// f9e13058-4acb-49fb-b494-869b7f291187 786f2e7b-1a12-4be9-a829-fde41cfbea72
/* Request a new target */ 
export async function requestNewTargetAssignment(conventionId, hunterId) {

  let currentTargets = await getHunterTargetIds(conventionId, hunterId);
  // Don't add a target if the player is already capped

  if (currentTargets.length >= NR_TARGETS) return { newTarget: undefined, targets: currentTargets };
  const { newTarget, error } = await getNewTarget(conventionId, hunterId, currentTargets);
  if (!newTarget) return { newTarget: undefined, targets: currentTargets, error: error }

  currentTargets.push(newTarget);
  let targetListString = stringFromTargetList(currentTargets);

  const { data, updateError } = await supabase
    .from("players")
    .update({ "targets": targetListString})
    .eq("convention_id", conventionId)
    .eq("app_uid", hunterId)

  return { newTarget: newTarget, targets: await getTargetProfiles(conventionId, hunterId), error: updateError }
}

export async function requestFreshTargetAssignment(conventionId, appUid) {
  return new Promise ( async (resolve) => {
    const { data, updateError } = await supabase
      .from("players")
      .update({ "targets": "" })
      .eq("convention_id", conventionId)
      .eq("app_uid", appUid)

      let newTargets = []
      for (let i = 0; i < NR_TARGETS; i++) {
          let { newTarget, targets, error } = await requestNewTargetAssignment(conventionId, appUid);
          newTargets = targets
      }
      resolve(newTargets)
  })
  
}

/* Returns the player-visible data for the targets of a given hunter */
export async function getTargetProfiles(conventionId, hunterId) {
  const targetIds = await getHunterTargetIds(conventionId, hunterId);
  let ret = (
    await Promise.all(targetIds.map(async (id) => await getTargetInformation(id, conventionId, hunterId)))
  ).filter(Boolean)
  return ret;
}

// Internal base fetcher (not exported as a server action)
async function fetchPlayerRecord(conventionId, playerId, selectFields = "*") {
  const { data, error } = await supabase
    .from("players")
    .select(selectFields)
    .eq("convention_id", conventionId)
    .eq("app_uid", playerId)
    .single();

  if (error || !data) return null;

  return {
    ...data,
    photoUrl: `/c/${conventionId}/player/${data.app_uid}/photo`,
  };
}

// Returns only what a hunter is allowed to know about one of their targets —
// never the full player row (no code, no contact, no invisible/approved
// flags, no raw storage key). Photos are exposed as a stable link to
// /c/[conventionId]/player/[playerUid]/photo, which resolves the actual
// signed URL server-side, on demand, the first (and only) time it's
// requested — we never call createSignedUrl ourselves here.
// ----------------------------------------------------
// PLAYER ACCESS (Public / Shielded)
// ----------------------------------------------------
export async function getTargetInformation(targetId, conventionId, hunterId) {
  // TODO: validate that (hunterId, targetId) is an active hunter/target pair
  // for this convention before returning anything — right now any target ID
  // is resolved unconditionally.
  return fetchPlayerRecord(
    conventionId,
    targetId,
    "app_uid, character, series, description, name"
  );
}

// ----------------------------------------------------
// ADMIN ACCESS (Full Data)
// ----------------------------------------------------
export async function getAdminPlayerProfile(conventionId, playerId) {
  // MUST verify admin session / permissions here before returning sensitive data
  // e.g., await assertAdmin(conventionId);

  return fetchPlayerRecord(conventionId, playerId, "*");
}

export async function checkPlayerCode(conventionId, targetId, code) {
  const { data: matches, error } = await supabase
    .from("players")
    .select("*")
    .eq("convention_id", conventionId)
    .eq("app_uid", targetId)
    .eq("code", code);

  const isValid = matches?.length > 0;

  return isValid;
}

async function getCurrentScore(conventionId, hunterId) {
  return new Promise(async (resolve) => {
    const { data } = await supabase
      .from("players")
      .select("score")
      .eq("convention_id", conventionId)
      .eq("app_uid", hunterId)
      .single();
    resolve(data?.score)
  })
}

async function incrementScore(conventionId, hunterId, value) {
  return new Promise(async (resolve) => {
    const currentScore = await getCurrentScore(conventionId, hunterId);
    const newScore = currentScore + value;
    await supabase
      .from("players")
      .update({ "score": newScore })
      .eq("convention_id", conventionId)
      .eq("app_uid", hunterId);
    resolve(newScore);
  })

}

/* Given a target and its code, award the player with score and remove the target from the list, returning the updated target list */
export async function performCapture(conventionId, hunterId, targetId) {
  let currentTargets = await getHunterTargetIds(conventionId, hunterId);
  currentTargets = currentTargets.filter((id) => id != targetId);
  let currentScore = await getCurrentScore(conventionId, hunterId);

  let ret = {
    targets: currentTargets,
    score: currentScore,
    error: undefined
  }

  // Log the capture in the table
  const insertError = await insertCapture(conventionId, hunterId, targetId);

  if (insertError) {
    console.error("Something went wrong trying to insert the capture in the table:", insertError)
    ret.error = insertError
    return ret
  }

  // Remove the capture from the player's targets
  const { data, error } = await supabase
    .from("players")
    .update({ "targets": stringFromTargetList(currentTargets) })
    .eq("convention_id", conventionId)
    .eq("app_uid", hunterId);

  if (error) {
    console.error("Something went wrong trying to update the player:", error)
    ret.error = error
    return ret
  }

  ret.targets = await getTargetProfiles(conventionId, hunterId);
  ret.score = await incrementScore(conventionId, hunterId, CAPTURE_REWARD);

  return ret
}

/* Given a hunter, target and a convention, insert a capture pair into the captures table */
export async function insertCapture(conventionId, hunterId, targetId) {
  const newRow = {
    // Database fields
    convention_id: conventionId,
    hunter_id: hunterId,
    target_id: targetId,
    capture_time: new Date().toISOString(),
    score: CAPTURE_REWARD
  }

  const { error } = await supabase.from("captures").insert(newRow);
  return error
}

/* Get the hunters current target list */
async function getHunterCaptureIds(conventionId, hunterId) {
  return new Promise(async (resolve) => {
    /* Select all hunters not equal to the requesting hunter */
    const { data: captures, error } = await supabase
      .from("captures")
      .select("target_id")
      .eq("convention_id", conventionId)
      .eq("hunter_id", hunterId)
    resolve({ targets: captures?.map((target) => target.target_id), error: error })
  })
}