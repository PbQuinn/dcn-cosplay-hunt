"use server";

import { approvalStatuses, NR_TARGETS } from "@/lib/constants";
import { supabase } from "@/lib/supabaseServer";
import { stringFromTargetList, targetListFromString } from "@/lib/targetList";

export async function updatePlayerApproval(target, status) {
console.log(`Updating approval status for targetId: ${target.id} to status: ${status}`);

  const { data, error } = await supabase
    .from("players")
    .update({ approved: status })
    .eq("id", target.id)
    .select();

  if (error) throw new Error(error.message);
  return data;
}

/* Get the UID of a random fellow hunter */
export async function getNewTarget(conventionId, hunterId) {
  // TODO: Implement query that only considers records that are:
  // * not already in the logged captures
  // * not already in the target list of the current hunter
  /* Select all hunters not equal to the requesting hunter */
  const { data: candidateTargetIds, error } = await supabase
    .from("players")
    .select("app_uid")
    .eq("convention_id", conventionId)
    .eq("invisible", false)
    .eq("approved", approvalStatuses.APPROVED)
    .neq("app_uid", hunterId);

  let candidates = candidateTargetIds ? candidateTargetIds : [];
  let index = Math.floor(Math.random() * candidates.length)
  let target = candidates[index];
  return target ? target.app_uid : undefined
}


/* Get the hunters current target list */
export async function getHunterTargetIds(conventionId, hunterId) {
  return new Promise(async (resolve) => {
    /* Select all hunters not equal to the requesting hunter */
    const { data: hunterLine, error } = await supabase
      .from("players")
      .select("targets")
      .eq("convention_id", conventionId)
      .eq("app_uid", hunterId)
      .single()

    resolve(targetListFromString(hunterLine?.targets))
  })
}

/* Request a new target */
export async function requestNewTargetAssignment(conventionId, hunterId) {

  let currentTargets = await getHunterTargetIds(conventionId, hunterId);
  // Don't add a target if the player is already capped
  if (currentTargets.length >= NR_TARGETS) return { newTarget: undefined, targets: currentTargets };
  const newTarget = await getNewTarget(conventionId, hunterId);

  if (!newTarget) return { newTarget: undefined, targets: currentTargets }

  currentTargets.push(newTarget);

  const { data, error } = await supabase
    .from("players")
    .update({ "targets": stringFromTargetList(currentTargets) })
    .eq("convention_id", conventionId)
    .eq("app_uid", hunterId)

  return { newTarget: newTarget, targets: await getTargetProfiles(conventionId, hunterId) }
}

/* Returns the player-visible data for the targets of a given hunter */
export async function getTargetProfiles(conventionId, hunterId) {
  const targetIds = await getHunterTargetIds(conventionId, hunterId);
  return (
    await Promise.all(targetIds.map((id) => getTargetInformation(id, conventionId, hunterId)))
  ).filter(Boolean);
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
  // If there is a match, that means the code entered was correct (conventionId/targetAppUid pairs are unique)
  return matches?.length > 0
}

async function incrementScore(conventionId, hunterId, value) {
  return new Promise(async (resolve) => {
    const { data: currentScore } = await supabase
      .from("players")
      .select("score")
      .eq("convention_id", conventionId)
      .eq("app_uid", hunterId)
      .single();

    const newScore = currentScore?.score + value;

    await supabase
      .from("players")
      .update({ "score": newScore })
      .eq("convention_id", conventionId)
      .eq("app_uid", hunterId);

    resolve(newScore)
  })

}

/* Given a target and its code, award the player with score and remove the target from the list, returning the updated target list */
export async function performCapture(conventionId, hunterId, targetId) {
  let currentTargets = await getHunterTargetIds(conventionId, hunterId);
  currentTargets = currentTargets.filter((id) => id != targetId);

  const { data, error } = await supabase
    .from("players")
    .update({ "targets": stringFromTargetList(currentTargets) })
    .eq("convention_id", conventionId)
    .eq("app_uid", hunterId);
  
    const ret = { 
    targets: await getTargetProfiles(conventionId, hunterId), 
    score: await incrementScore(conventionId, hunterId, 1) 
  } 

  return ret
}

