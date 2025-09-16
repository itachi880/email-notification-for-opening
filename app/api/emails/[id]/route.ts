import { NextResponse } from "next/server";
import { prismaClient } from "@/lib/prisma-client";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const emailId = parseInt(params.id);

    // Get email with all opens (including soft deleted ones)
    const email = await prismaClient.email.findUnique({
      where: { id: emailId },
      include: {
        emailOpens: {
          orderBy: {
            openedAt: "desc",
          },
        },
      },
    });

    if (!email) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    // Transform the data
    const transformedEmail = {
      id: email.id,
      recipient_email: email.recipientEmail,
      subject: email.subject,
      content: email.content,
      tracking_id: email.trackingId,
      created_at: email.createdAt.toISOString(),
      email_opens: email.emailOpens.map((open) => ({
        id: open.id,
        opened_at: open.openedAt.toISOString(),
        ip_address: open.ipAddress,
        user_agent: open.userAgent,
        is_deleted: open.isDeleted,
        deleted_at: open.deletedAt?.toISOString() || null,
      })),
      active_opens: email.emailOpens.filter((open) => !open.isDeleted).length,
      total_opens: email.emailOpens.length,
    };

    return NextResponse.json(transformedEmail);
  } catch (error) {
    console.error("Error fetching email details:", error);
    return NextResponse.json(
      { error: "Failed to fetch email details" },
      { status: 500 }
    );
  }
}
