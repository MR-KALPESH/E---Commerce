import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDB";
import { revalidateTag } from "next/cache";

export async function GET() {
  try {
    const settings = await prisma.headerSetting.findFirst();
    return NextResponse.json({ settings }, { status: 200 });
  } catch (error) {
    console.error("[ADMIN_HEADER_SETTINGS_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { headerLogo, emailLogo } = body;

    const existing = await prisma.headerSetting.findFirst();

    let settings;
    if (existing) {
      settings = await prisma.headerSetting.update({
        where: { id: existing.id },
        data: { headerLogo, emailLogo },
      });
    } else {
      settings = await prisma.headerSetting.create({
        data: { headerLogo, emailLogo },
      });
    }

    revalidateTag("header-setting", "max");
    revalidateTag("header-logo", "max");
    revalidateTag("email-logo", "max");

    return NextResponse.json({ message: "Header settings saved successfully", settings }, { status: 200 });
  } catch (error) {
    console.error("[ADMIN_HEADER_SETTINGS_POST_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
