"use server";

import { approvalStatuses, CAPTURE_REWARD, NR_TARGETS } from "@/lib/constants";
import { supabase } from "@/lib/supabaseServer";
import { stringFromTargetList, targetListFromString } from "@/lib/targetList";



/* Get the UID of a random fellow hunter */
export async function getNewTarget(conventionId, hunterId, currentTargets) {
  // TODO: Implement query that only considers records that are:
  // * not already in the logged captures
  // * not already in the target list of the current hunter
  const captures = await getHunterCaptureIds(conventionId, hunterId)

  if (captures.error) {
    console.error(captures.error)
    return undefined
  }

  const forbiddenTargets = currentTargets.concat(captures.targets)
  
  /* Select all hunters not equal to the requesting hunter */
  const { data: candidateTargetIds, error } = await supabase
    .from("players")
    .select("app_uid")
    .eq("convention_id", conventionId)
    .eq("invisible", false)
    .eq("approved", approvalStatuses.APPROVED)
    .notIn("app_uid", forbiddenTargets)
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
  const newTarget = await getNewTarget(conventionId, hunterId, currentTargets);

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


// Returns only what a hunter is allowed to know about one of their targets —
// never the full player row (no code, no contact, no invisible/approved
// flags, no raw storage key). Photos are exposed as a stable link to
// /c/[conventionId]/player/[playerUid]/photo, which resolves the actual
// signed URL server-side, on demand, the first (and only) time it's
// requested — we never call createSignedUrl ourselves here.
export async function getTargetInformation(targetId, conventionId, hunterId) {
  // TODO: validate that (hunterId, targetId) is an active hunter/target pair
  // for this convention before returning anything — right now any target ID
  // is resolved unconditionally.
  const { data: targetData, error } = await supabase
    .from("players")
    .select("app_uid, character, series, description, name")
    .eq("convention_id", conventionId)
    .eq("app_uid", targetId)
    .single();

  if (error || !targetData) return null;

  return {
    app_uid: targetData.app_uid,
    character: targetData.character,
    series: targetData.series,
    description: targetData.description,
    name: targetData.name,
    photoUrl: `/c/${conventionId}/player/${targetData.app_uid}/photo`,
  };
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

    console.log(ret)

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
    resolve({ targets: captures?.map( (target) => target.target_id), error: error })
  })
}