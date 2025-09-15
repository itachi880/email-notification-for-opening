import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get the most recent tracking ID from the database
    const recentEmail = await prisma.email.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { trackingId: true, recipientEmail: true, subject: true }
    });

    if (!recentEmail) {
      return NextResponse.json({ 
        error: "No tracking emails found in database" 
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const trackingUrl = `${baseUrl}/api/track/${recentEmail.trackingId}`;

    return NextResponse.json({
      success: true,
      recentEmail,
      trackingUrl,
      testInstructions: [
        "1. Open the trackingUrl in a new browser tab",
        "2. You should see a 1x1 pixel image",
        "3. Check the browser console for tracking logs",
        "4. Check your dashboard for the new open record"
      ]
    });

  } catch (error) {
    console.error('Error in test-track:', error);
    return NextResponse.json({ 
      error: "Database error", 
      details: error 
    }, { status: 500 });
  }
}