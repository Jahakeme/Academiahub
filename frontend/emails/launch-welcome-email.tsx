import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";

const APP_URL = (
  process.env.NEXTAUTH_URL ?? "https://academiahubafrica.org"
).replace(/\/+$/, "");
const LOGO_URL = `${APP_URL}/assets/images/Logoimage.png`;
const LAUNCH_DATE_LABEL = "May 18, 2026";

export function LaunchWelcomeEmail() {
  return (
    <Html>
      <Head />
      <Preview>
        You&rsquo;re on the AcademiaHub launch list — see you on{" "}
        {LAUNCH_DATE_LABEL}.
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src={LOGO_URL}
              alt="AcademiaHub"
              width="220"
              style={logo}
            />
            <Text style={subtitle}>You&rsquo;re on the launch list</Text>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>
              Thanks for signing up. We&rsquo;ll email you the moment
              AcademiaHub goes live on <strong>{LAUNCH_DATE_LABEL}</strong>.
            </Text>
            <Text style={paragraph}>
              In the meantime, sit tight. We&rsquo;re putting the finishing
              touches on a place where students, researchers, and academics
              across Africa can share work, find collaborators, and build
              their reputations.
            </Text>
            <Text style={hint}>
              If you didn&rsquo;t sign up for this, you can safely ignore this
              email.
            </Text>
          </Section>

          <Section style={footer}>
            <Hr style={divider} />
            <Text style={footerText}>
              This is an automated message from AcademiaHub. Please do not
              reply.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default LaunchWelcomeEmail;

const body: React.CSSProperties = {
  margin: 0,
  padding: 0,
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  backgroundColor: "#f4f4f5",
};

const container: React.CSSProperties = {
  maxWidth: "480px",
  margin: "40px auto",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
};

const header: React.CSSProperties = {
  padding: "40px 40px 20px",
  textAlign: "center",
};

const logo: React.CSSProperties = {
  display: "block",
  margin: "0 auto 24px",
  height: "auto",
};

const subtitle: React.CSSProperties = {
  margin: 0,
  fontSize: "16px",
  color: "#71717a",
};

const content: React.CSSProperties = {
  padding: "20px 40px",
};

const paragraph: React.CSSProperties = {
  margin: "0 0 16px",
  fontSize: "15px",
  color: "#3f3f46",
  lineHeight: 1.6,
};

const hint: React.CSSProperties = {
  margin: "20px 0 0",
  fontSize: "14px",
  color: "#71717a",
  lineHeight: 1.6,
};

const footer: React.CSSProperties = {
  padding: "20px 40px 40px",
};

const divider: React.CSSProperties = {
  border: "none",
  borderTop: "1px solid #e4e4e7",
  margin: "0 0 20px",
};

const footerText: React.CSSProperties = {
  margin: 0,
  fontSize: "12px",
  color: "#a1a1aa",
  textAlign: "center",
};
