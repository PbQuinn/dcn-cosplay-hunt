import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseServer";
import { loadPlayerFromUid } from "@/app/actions/player";

export async function GET(request, { params }) {
  // 1. Properly await and extract conventionId and playerUid matching folder structure
  const { conventionId, playerUid } = await params;

  const cookieStore = await cookies();
  const appUid = cookieStore.get("hunter_app_uid")?.value;

  if (!appUid) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // 2. Fetch player photo path from Supabase
    const hunter = await loadPlayerFromUid(playerUid);

    if (!hunter?.image_url) {
      return new NextResponse("Not found", {
        status: 404,
        headers: { "Cache-Control": "no-store, max-age=0" },
      });
    }

    // 3. Generate signed URL for private bucket
    const { data, error: signedUrlError } = await supabase.storage
      .from("hunter-photos")
      .createSignedUrl(hunter.image_url, 60 * 10);

    if (signedUrlError || !data?.signedUrl) {
      console.error("❌ [Photo Route] Failed to create signed URL:", signedUrlError);
      return new NextResponse("Could not resolve image", { status: 500 });
    }

    return NextResponse.redirect(data.signedUrl);
  } catch (err) {
    console.error("❌ [Photo Route] Unexpected error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}