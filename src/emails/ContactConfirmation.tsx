// src/emails/ContactConfirmation.tsx
import * as React from 'react';
import { 
  Html, Body, Head, Heading, Text, Container, 
  Preview, Section, Hr, Img, Link, Button
} from '@react-email/components';

interface ContactConfirmationProps {
  name: string;
  email: string;
  subject: string;
}

export const ContactConfirmation = ({
  name,
  email,
  subject,
}: ContactConfirmationProps) => {
  // Base64 encoded logo
  const logoBase64 = `data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0idXJsKCNwYWludDFfbGluZWFyKSIvPjxwYXRoIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyek0xMSAxNkg5VjhoMnY4em00IDBoLTJWOGgydjh6IiBmaWxsPSJ3aGl0ZSIvPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQxX2xpbmVhciIgeDE9IjAiIHkxPSIwIiB4Mj0iMjQiIHkyPSIyNCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPjxzdG9wIHN0b3AtY29sb3I9IiM4NDNkZmYiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMwY2I4ZmYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48L3N2Zz4=`;

  return (
    <Html>
      <Head />
      <Preview>We've received your message - NoVerif Support</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src={logoBase64}
              width="40"
              height="40"
              alt="NoVerif Logo"
              style={logoStyle}
            />
            <Text style={logoText}>NoVerif</Text>
          </Section>
          
          <Heading style={{
            fontSize: '24px',
            color: '#333',
            textAlign: 'center' as const,
            margin: '30px 0',
            padding: '0',
          }}>We've Received Your Message</Heading>
          
          <Section style={section}>
            <Text style={paragraph}>
              Hi {name},
            </Text>
            <Text style={paragraph}>
              Thank you for contacting NoVerif support. We've received your message about "{subject}" and will get back to you as soon as possible.
            </Text>
            <Text style={paragraph}>
              Our team typically responds within 24 hours during business days. If your matter is urgent, you can also reach us via our live chat on the website during business hours.
            </Text>
            <Text style={paragraph}>
              This is an automated confirmation. Please do not reply to this email.
            </Text>
            
            <Button href="https://noverif.com/support#faq" style={{
              backgroundColor: '#843dff',
              color: '#fff',
              padding: '12px 20px',
              borderRadius: '6px',
              textDecoration: 'none',
              textAlign: 'center' as const,
              fontWeight: 'bold',
              fontSize: '16px',
              margin: '20px 0',
              display: 'inline-block',
            }}>
              View Our FAQ
            </Button>
          </Section>
          
          <Hr style={hr} />
          
          <Section style={{
            textAlign: 'center' as const,
            padding: '0 24px',
          }}>
            <Text style={footerText}>
              © {new Date().getFullYear()} NoVerif. All rights reserved.
            </Text>
            <Text style={footerLinks}>
              <Link href="https://noverif.com/privacy-policy" style={link}>Privacy Policy</Link> • 
              <Link href="https://noverif.com/terms-of-service" style={link}>Terms of Service</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#f9fafb',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0',
  maxWidth: '600px',
};

const logoContainer = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '24px',
};

const logoStyle = {
  borderRadius: '8px',
};

const logoText = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#333',
  marginLeft: '12px',
  background: 'linear-gradient(to right, #843dff, #0cb8ff)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

const section = {
  backgroundColor: '#ffffff',
  padding: '24px',
  borderRadius: '8px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  margin: '0 0 24px',
};

const paragraph = {
  fontSize: '16px',
  color: '#333',
  lineHeight: '1.6',
  marginBottom: '16px',
};

const hr = {
  borderColor: '#eaeaea',
  margin: '16px 0',
};

const footerText = {
  fontSize: '14px',
  color: '#666',
  margin: '8px 0',
};

const footerLinks = {
  fontSize: '14px',
  color: '#666',
  margin: '16px 0',
};

const link = {
  color: '#0cb8ff',
  textDecoration: 'none',
  margin: '0 4px',
};

export default ContactConfirmation;