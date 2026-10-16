import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseServer";
import { loadConvention } from "@/app/actions/convention";

export async function GET(request, { params }) {
    const { conventionId } = await params;

    try {
        const convention = await loadConvention(conventionId);

        // Generate signed URL for private bucket
        const { data, error: signedUrlError } = await supabase.storage
            .from("convention-logos")
            .createSignedUrl(convention.logo_url, 60 * 10);

        if (signedUrlError || !data?.signedUrl) {
            console.error("❌ [Convention Logo Route] Failed to create signed URL:", signedUrlError);
            return new NextResponse("Could not resolve image", { status: 500 });
        }

        return NextResponse.redirect(data.signedUrl);
    } catch (err) {
        console.error("❌ [Convention Logo Route] Unexpected error:", err);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}