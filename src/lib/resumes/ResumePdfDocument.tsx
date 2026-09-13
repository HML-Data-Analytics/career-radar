import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { TailoredResumeContent } from "@/lib/validations/resumeTailor";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1a1a1a",
  },
  name: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
  },
  contact: {
    fontSize: 9,
    color: "#555555",
    marginTop: 2,
  },
  headline: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginTop: 12,
  },
  summary: {
    fontSize: 10,
    marginTop: 4,
    lineHeight: 1.4,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginTop: 16,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
    paddingBottom: 2,
  },
  skillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  skillChip: {
    fontSize: 9,
    backgroundColor: "#f0f0f0",
    borderRadius: 3,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginRight: 4,
    marginBottom: 4,
  },
  experienceBlock: {
    marginBottom: 10,
  },
  experienceHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  experienceTitle: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
  },
  experienceDates: {
    fontSize: 9,
    color: "#555555",
  },
  experienceCompany: {
    fontSize: 10,
    color: "#333333",
    marginBottom: 3,
  },
  bulletRow: {
    flexDirection: "row",
    marginTop: 2,
  },
  bulletMark: {
    width: 10,
  },
  bulletText: {
    flex: 1,
    lineHeight: 1.35,
  },
});

function formatDateRange(startDate: string | null, endDate: string | null, isCurrent: boolean) {
  const start = startDate ?? "?";
  const end = isCurrent ? "Present" : (endDate ?? "?");
  return `${start} - ${end}`;
}

export function ResumePdfDocument({
  name,
  email,
  location,
  tailored,
}: {
  name: string;
  email: string | null;
  location: string | null;
  tailored: TailoredResumeContent;
}) {
  const contactLine = [email, location].filter(Boolean).join(" · ");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{name}</Text>
        {contactLine ? <Text style={styles.contact}>{contactLine}</Text> : null}

        <Text style={styles.headline}>{tailored.headline}</Text>
        <Text style={styles.summary}>{tailored.professionalSummary}</Text>

        {tailored.skills.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsRow}>
              {tailored.skills.map((skill) => (
                <Text key={skill} style={styles.skillChip}>
                  {skill}
                </Text>
              ))}
            </View>
          </>
        ) : null}

        {tailored.experiences.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Experience</Text>
            {tailored.experiences.map((exp) => (
              <View key={`${exp.company}-${exp.title}`} style={styles.experienceBlock} wrap={false}>
                <View style={styles.experienceHeaderRow}>
                  <Text style={styles.experienceTitle}>{exp.title}</Text>
                  <Text style={styles.experienceDates}>
                    {formatDateRange(exp.startDate, exp.endDate, exp.isCurrent)}
                  </Text>
                </View>
                <Text style={styles.experienceCompany}>
                  {exp.company}
                  {exp.location ? ` · ${exp.location}` : ""}
                </Text>
                {exp.bullets.map((bullet) => (
                  <View key={bullet} style={styles.bulletRow}>
                    <Text style={styles.bulletMark}>-</Text>
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ))}
          </>
        ) : null}
      </Page>
    </Document>
  );
}
