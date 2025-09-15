import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { recipientEmail, subject, content } = await request.json();

    if (!recipientEmail) {
      return NextResponse.json(
        { error: "Recipient email is required" },
        { status: 400 }
      );
    }

    // Generate a unique tracking ID
    const trackingId = nanoid(10);

    // Insert email record into database with user ID
    const email = await prisma.email.create({
      data: {
        recipientEmail,
        subject: subject || "",
        content: content || "",
        trackingId,
        userId: user.id, // Link to authenticated user
      },
    });

    // Generate the tracking URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const trackingUrl = `${baseUrl}/api/track/${trackingId}`;

    return NextResponse.json({
      success: true,
      trackingId,
      trackingUrl,
      emailId: email.id,
    });
  } catch (error) {
    console.error("Error generating tracking URL:", error);
    return NextResponse.json(
      { error: "Failed to generate tracking URL" },
      { status: 500 }
    );
  }
}
