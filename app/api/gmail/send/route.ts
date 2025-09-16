import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { prismaClient } from "@/lib/prisma-client";
import { nanoid } from "nanoid";
import {
  getCurrentUser,
  getUserGmailCredentials,
  createUserGmailConfig,
} from "@/lib/auth-utils";

interface SendEmailRequest {
  to: string;
  subject: string;
  content: string;
  isHtml?: boolean;
  includeTracking?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get user's Gmail credentials
    const credentials = await getUserGmailCredentials(user.id);
    console.log("User credentials check:", {
      hasCredentials: !!credentials,
      userEmail: credentials?.user,
      hasPassword: !!credentials?.password,
    });

    if (!credentials) {
      return NextResponse.json(
        { error: "Gmail credentials not found. Please log in again." },
        { status: 400 }
      );
    }

    const requestData: SendEmailRequest = await request.json();
    const { to, subject, content, includeTracking = false } = requestData;
    let isHtml = requestData.isHtml || false;

    if (!to || !subject || !content) {
      return NextResponse.json(
        { error: "To, subject, and content are required" },
        { status: 400 }
      );
    }

    // Create transporter with user's credentials
    const gmailConfig = createUserGmailConfig(credentials);
    console.log("SMTP Config:", {
      host: gmailConfig.smtp.host,
      port: gmailConfig.smtp.port,
      secure: gmailConfig.smtp.secure,
      hasAuth: !!gmailConfig.smtp.auth,
      authUser: gmailConfig.smtp.auth.user,
      hasAuthPass: !!gmailConfig.smtp.auth.pass,
    });

    const transporter = nodemailer.createTransport(gmailConfig.smtp);

    // Verify the connection before proceeding
    try {
      await transporter.verify();
      console.log("SMTP connection verified successfully");
    } catch (verifyError) {
      console.error("SMTP verification failed:", verifyError);
      throw verifyError; // This will be caught by the outer catch block
    }

    let finalContent = content;
    let trackingId: string | null = null;

    // Add tracking pixel if requested
    if (includeTracking) {
      trackingId = nanoid(10);

      console.log("Creating tracking record:", {
        trackingId,
        to,
        userId: user.id,
      });

      // Create tracking record in database
      await prismaClient.email.create({
        data: {
          recipientEmail: to,
          subject,
          content,
          trackingId,
          userId: user.id,
        },
      });

      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      const trackingUrl = `${baseUrl}/api/track/${trackingId}`;

      console.log("Generated tracking URL:", trackingUrl);

      if (isHtml) {
        // For HTML emails, add invisible tracking pixel
        finalContent += `<img src="${trackingUrl}" width="1" height="1"  />`;
      } else {
        // For plain text emails, convert to HTML and add tracking pixel
        finalContent = ` <html> <body> <p>${finalContent}</p> <img src="${trackingUrl}" width="1" height="1" 
        /> </body> </html>`;
        isHtml = true; // Switch to HTML mode to include the pixel
      }
    }

    console.log("Sending email:", {
      from: credentials.user,
      to,
      subject,
      isHtml,
      hasTracking: !!trackingId,
      contentLength: finalContent.length,
      contentPreview: finalContent.substring(finalContent.length - 200), // Last 200 chars to see tracking pixel
    });

    // Send email
    const info = await transporter.sendMail({
      from: credentials.user, // Use authenticated user's email
      to,
      subject,
      [isHtml ? "html" : "text"]: finalContent,
    });

    // Save sent email to database
    try {
      await prismaClient.sentEmail.create({
        data: {
          recipientEmail: to,
          subject,
          content: finalContent,
          messageId: info.messageId,
          trackingId,
          userId: user.id,
          sentAt: new Date(),
        },
      });
    } catch (dbError) {
      console.warn("Failed to save sent email to database:", dbError);
    }

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      trackingId,
      message: "Email sent successfully",
    });
  } catch (error: any) {
    console.error("Error sending email:", error);

    // Provide more specific error messages
    let errorMessage = "Failed to send email. Please try again.";

    if (error.code === "EAUTH") {
      errorMessage =
        "Gmail authentication failed. Please log out and log back in with your correct Gmail App Password.";
    } else if (error.code === "ECONNECTION") {
      errorMessage =
        "Connection failed. Please check your internet connection.";
    } else if (error.message?.includes("Invalid login")) {
      errorMessage =
        "Invalid Gmail credentials. Please verify your App Password.";
    } else if (error.message?.includes("Missing credentials")) {
      errorMessage =
        "Gmail credentials are missing. Please log out and log back in.";
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
