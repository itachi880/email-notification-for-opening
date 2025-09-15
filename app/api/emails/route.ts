import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";

export async function POST(request: Request) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { action, emailId } = await request.json();

    if (action === "reset_opens" && emailId) {
      // First verify the email belongs to the current user
      const email = await prisma.email.findFirst({
        where: {
          id: parseInt(emailId),
          userId: user.id,
        },
      });

      if (!email) {
        return NextResponse.json(
          { error: 'Email not found or access denied' },
          { status: 404 }
        );
      }

      // Soft delete all opens for the specified email
      await prisma.emailOpen.updateMany({
        where: {
          emailId: parseInt(emailId),
          isDeleted: false,
        },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user's emails with their open statistics (excluding soft deleted opens)
    const emails = await prisma.email.findMany({
      where: {
        userId: user.id, // Only get current user's emails
      },
      include: {
        emailOpens: {
          where: {
            isDeleted: false,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform the data to match the expected format
    const transformedEmails = emails.map((email: any) => ({
      id: email.id,
      recipient_email: email.recipientEmail,
      subject: email.subject,
      content: email.content,
      tracking_id: email.trackingId,
      created_at: email.createdAt.toISOString(),
      open_count: email.emailOpens.length,
      first_opened_at:
        email.emailOpens.length > 0
          ? email.emailOpens
              .sort(
                (a: any, b: any) => a.openedAt.getTime() - b.openedAt.getTime()
              )[0]
              .openedAt.toISOString()
          : null,
      last_opened_at:
        email.emailOpens.length > 0
          ? email.emailOpens
              .sort(
                (a: any, b: any) => b.openedAt.getTime() - a.openedAt.getTime()
              )[0]
              .openedAt.toISOString()
          : null,
    }));

    // Get user-specific statistics (excluding soft deleted opens)
    const totalEmails = await prisma.email.count({
      where: { userId: user.id },
    });
    const totalOpens = await prisma.emailOpen.count({
      where: {
        isDeleted: false,
        email: { userId: user.id },
      },
    });
    const uniqueOpens = await prisma.emailOpen
      .groupBy({
        by: ["emailId"],
        where: {
          isDeleted: false,
          email: { userId: user.id },
        },
      })
      .then((groups: any[]) => groups.length);

    return NextResponse.json({
      emails: transformedEmails,
      statistics: {
        totalEmails,
        totalOpens,
        uniqueOpens,
        openRate:
          totalEmails > 0
            ? ((uniqueOpens / totalEmails) * 100).toFixed(2)
            : "0.00",
      },
    });
  } catch (error) {
    console.error("Error fetching emails:", error);
    return NextResponse.json(
      { error: "Failed to fetch emails" },
      { status: 500 }
    );
  }
}
