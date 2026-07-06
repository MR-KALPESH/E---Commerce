import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";

export async function GET(req: NextRequest) {
  try {
    // Revalidate products tag cache
    revalidateTag("products", "max");
    revalidateTag("products", {});

    // Revalidate categories tag cache
    revalidateTag("categories", "max");
    revalidateTag("categories", {});

    // Revalidate blogs tag cache
    revalidateTag("blogs", "max");
    revalidateTag("blogs", {});

    // Revalidate hero sections cache
    revalidateTag("heroSliders", "max");
    revalidateTag("heroBanners", "max");
    
    // Revalidate paths
    revalidatePath("/", "layout");
    revalidatePath("/shop-with-sidebar", "page");
    revalidatePath("/products", "page");

    return NextResponse.json({
      message: "Cache revalidated successfully! Refresh your storefront page to view the seeded products.",
      success: true
    }, { status: 200 });
  } catch (error) {
    console.error("[REVALIDATE_ERROR]", error);
    return NextResponse.json({ error: "Failed to revalidate cache" }, { status: 500 });
  }
}
