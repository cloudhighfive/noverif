// src/app/api/send-support-email/route.ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { renderAsync } from '@react-email/render';
import SupportEmail from '@/emails/SupportEmail';
import ContactConfirmation from '@/emails/ContactConfirmation';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Render the support email HTML using the template
    const supportEmailHtml = await renderAsync(
      SupportEmail({ 
        name,
        email,
        subject,
        message
      })
    );

    // Render the confirmation email HTML
    const confirmationEmailHtml = await renderAsync(
      ContactConfirmation({
        name,
        email,
        subject
      })
    );

    // Send the support email
    const supportEmailResult = await resend.emails.send({
      from: 'NoVerif Support <support@noverif.com>', // Update with your domain
      to: 'support@noverif.com', // The recipient of support messages
      replyTo: email,
      subject: `Support Request: ${subject}`,
      html: supportEmailHtml,
    });

    // Send confirmation to the user
    const confirmationResult = await resend.emails.send({
      from: 'NoVerif Support <support@noverif.com>', // Update with your domain
      to: email, // Send to the user
      subject: `We've received your message - NoVerif Support`,
      html: confirmationEmailHtml,
    });

    if (supportEmailResult.error || confirmationResult.error) {
      console.error('Error sending email:', 
        supportEmailResult.error || confirmationResult.error
      );
      return NextResponse.json({ 
        error: (supportEmailResult.error || confirmationResult.error)?.message 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      supportMessageId: supportEmailResult.data?.id,
      confirmationMessageId: confirmationResult.data?.id 
    });
  } catch (error) {
    console.error('Email sending failed:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}