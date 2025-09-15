import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: { trackingId: string } }
) {
  try {
    const { trackingId } = params;
    console.log('Tracking request received:', {
      trackingId,
      url: request.url,
      method: request.method,
      userAgent: request.headers.get('user-agent')
    });

    // Find the email by tracking ID
    const email = await prisma.email.findUnique({
      where: { trackingId },
    });
    
    console.log('Email lookup result:', {
      found: !!email,
      emailId: email?.id,
      recipientEmail: email?.recipientEmail
    });

    if (!email) {
      // Return the custom image even if tracking ID not found
      const imageBuffer = await getCustomImage();
      return new NextResponse(imageBuffer as BodyInit, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    }

    // Get client IP and user agent with better IP detection
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const cfConnectingIp = request.headers.get("cf-connecting-ip");
    const clientIp = request.headers.get("x-client-ip");

    // Get the first valid IP from the chain
    const ip =
      forwardedFor?.split(",")[0]?.trim() ||
      realIp ||
      cfConnectingIp ||
      clientIp ||
      "unknown";

    const userAgent = request.headers.get("user-agent") || "unknown";

    // Record the email open
    const emailOpen = await prisma.emailOpen.create({
      data: {
        emailId: email.id,
        ipAddress: ip,
        userAgent: userAgent,
      },
    });
    
    console.log('Email open recorded successfully:', {
      openId: emailOpen.id,
      emailId: email.id,
      ip,
      timestamp: emailOpen.openedAt
    });

    // Return the custom image
    const imageBuffer = await getCustomImage();
    return new NextResponse(imageBuffer as BodyInit, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error tracking email open:", error);
    // Still return the custom image even if there's an error
    const imageBuffer = await getCustomImage();
    return new NextResponse(imageBuffer as BodyInit, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  }
}

async function getCustomImage(): Promise<Buffer> {
  try {
    // Read the custom image.png file
    const imagePath = path.join(process.cwd(), "app", "image.png");
    const imageBuffer = fs.readFileSync(imagePath);
    return imageBuffer;
  } catch (error) {
    console.error("Error reading custom image:", error);
    // Fallback to a simple black pixel if custom image fails
    return Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
      0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0xf8, 0x0f, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x00, 0x18, 0xdd, 0x8d, 0xb4, 0x00, 0x00, 0x00, 0x00,
      0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);
  }
}
