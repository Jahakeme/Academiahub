import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface LaunchDigestEmailProps {
  emails?: string[];
  date?: string;
}

const PREVIEW_EMAILS = [
  "ada@example.com",
  "lovelace@example.com",
  "turing@example.com",
];

export function LaunchDigestEmail({
  emails = PREVIEW_EMAILS,
  date = new Date().toISOString().slice(0, 10),
}: LaunchDigestEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        {`${emails.length} new launch signup${emails.length === 1 ? "" : "s"} on ${date}`}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={{ padding: "24px" }}>
            <Text style={heading}>Daily Launch Signups — {date}</Text>
            <Text style={paragraph}>
              {emails.length} new email{emails.length === 1 ? "" : "s"} signed
              up for the launch announcement.
            </Text>
            <Section style={listBox}>
              {emails.map((e) => (
                <Text key={e} style={listItem}>
                  {e}
                </Text>
              ))}
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default LaunchDigestEmail;

const body: React.CSSProperties = {
  margin: 0,
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  backgroundColor: "#f4f4f5",
};
const container: React.CSSProperties = {
  maxWidth: "560px",
  margin: "32px auto",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
};
const heading: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: 700,
  margin: "0 0 12px",
  color: "#18181b",
};
const paragraph: React.CSSProperties = {
  fontSize: "14px",
  color: "#3f3f46",
  margin: "0 0 16px",
};
const listBox: React.CSSProperties = {
  backgroundColor: "#f4f4f5",
  borderRadius: "8px",
  padding: "16px",
};
const listItem: React.CSSProperties = {
  fontSize: "13px",
  color: "#27272a",
  margin: "0 0 4px",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
};
