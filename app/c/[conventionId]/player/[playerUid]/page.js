"use server"

import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { supabase } from "@/lib/supabaseServer";
import { targetListFromString } from "@/lib/targetList";
import { getTargetInformation, getTargetProfiles } from "@/app/actions/target";
import HunterPage from "./hunterProfile";
import HunterProfileClosed from "./hunterProfileClosed";

export default async function Page({ params }) {
  const { conventionId, playerUid } = await params;

  // Before returning the page, we first check if the player and convention passed in the URL make sense

  // Get the cookie assigned to the device, this should hold the unique hunter ID, and is 
  // used to validate if the player requesting is the owner of the profile in the URL
  const cookieStore = await cookies();
  const cookieUid = cookieStore.get("hunter_app_uid")?.value;

  // The URL does not match the player's own cookie.
  if (cookieUid !== playerUid) {
    notFound();
  }
  
  // After validating that user indeed is the owner of that profile, check if it exists
  const { data: hunter, error } = await supabase
    .from("players")
    .select("*")
    .eq("convention_id", conventionId)
    .eq("app_uid", playerUid)
    .single();

  if (error || !hunter) {
    notFound();
  }

  // Check if the passed convention is still valid AND ongoing
  const { data: convention } = await supabase
    .from("conventions")
    .select("*")
    .eq("id", conventionId)
    .single();

  // The convention in URL is not a valid convention
  if (convention.id !== conventionId) {
    notFound();
  }
  // The convention in URL valid, but is over already
  if (new Date(convention.end_date) < new Date()) {
    return <HunterProfileClosed
        hunter={hunter}
      />
  }

let targetProfiles = [];
  if (hunter?.targets) {
    targetProfiles = await getTargetProfiles(convention.id, hunter.app_uid);
  }

  return <HunterPage
      hunter={hunter}
      convention={convention}
      targets={targetProfiles}
    />
}