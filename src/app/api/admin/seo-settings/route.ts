import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDB";
import { revalidateTag } from "next/cache";

export async function GET() {
  try {
    const settings = await prisma.seoSetting.findFirst();
    return NextResponse.json({ settings }, { status: 200 });
  } catch (error) {
    console.error("[ADMIN_SEO_SETTINGS_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { siteName, metadescription, metaKeywords } = body;

    const existing = await prisma.seoSetting.findFirst();

    let settings;
    if (existing) {
      settings = await prisma.seoSetting.update({
        where: { id: existing.id },
        data: { siteName, metadescription, metaKeywords },
      });
    } else {
      settings = await prisma.seoSetting.create({
        data: { siteName, metadescription, metaKeywords },
      });
    }

    revalidateTag("seo-setting", "max");
    revalidateTag("site-name", "max");

    return NextResponse.json({ message: "SEO settings saved successfully", settings }, { status: 200 });
  } catch (error) {
    console.error("[ADMIN_SEO_SETTINGS_POST_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
