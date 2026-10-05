// /app/api/cosplay/[id]/photo/route.js

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseServer";

export async function GET(request, { params }) {
  const { conventionId, playerUid } = await params;

  const cookieStore = await cookies();
  const appUid = cookieStore.get("hunter_app_uid")?.value;

  if (!appUid) {
    return new NextResponse("Unauthorized", {
      status: 401,
    });
  }

  // TODO:
  // Look up player and determine whether this
  // player is allowed to see cosplay `id`.

  const { data: hunter, error } = await supabase
    .from("players")
    .select("image_url")
    .eq("convention_id", conventionId)
    .eq("app_uid", playerUid)
    .single();

  if (error || !hunter?.image_url) {
    return new NextResponse("Not found", {
      status: 404,
    });
  }

  const { data, error: signedUrlError } =
    await supabase.storage
      .from("hunter-photos")
      .createSignedUrl(
        hunter.image_url,
        60 * 10
      );

  if (signedUrlError) {
    return new NextResponse("Could not resolve image", {
      status: 500,
    });
  }

  return NextResponse.redirect(data.signedUrl);
}