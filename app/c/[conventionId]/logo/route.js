import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseServer";
import { loadConvention } from "@/app/actions/convention";

export async function GET(request, { params }) {
    const { conventionId } = await params;

    try {
        const convention = await loadConvention(conventionId);

        // If there is no logo_url, return a 404 so the image fails gracefully/shows nothing
        if (!convention?.logo_url) {
            return new NextResponse(null, { status: 404 });
        }

        // Generate signed URL for private bucket
        const { data, error: signedUrlError } = await supabase.storage
            .from("convention-logos")
            .createSignedUrl(convention.logo_url, 60 * 10);

        if (signedUrlError || !data?.signedUrl) {
            console.error("❌ [Convention Logo Route] Failed to create signed URL:", signedUrlError);
            return new NextResponse("Could not resolve image", { status: 404 });
        }

        return NextResponse.redirect(data.signedUrl);
    } catch (err) {
        console.error("❌ [Convention Logo Route] Unexpected error:", err);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}