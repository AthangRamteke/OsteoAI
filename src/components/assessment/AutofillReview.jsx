import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

const sectionTitles = {
  personal: "Personal Information",
  lifestyle: "Lifestyle",
  medical: "Medical & Family History",
};

const getStatus = (status) => {
  if (status === "found") {
    return { label: "Found", color: "#166534", bgcolor: "#DCFCE7" };
  }

  if (status === "manual_mapping_required") {
    return { label: "Needs mapping", color: "#92400E", bgcolor: "#FEF3C7" };
  }

  if (status === "reference_only") {
    return { label: "Reference", color: "#475569", bgcolor: "#F1F5F9" };
  }

  return { label: "Review", color: "#1D4ED8", bgcolor: "#EEF4FF" };
};

function AutofillReview({ result, fileName, onBack, onContinue }) {
  const fields = Array.isArray(result?.fields) ? result.fields : [];

  const groups = ["personal", "lifestyle", "medical"]
    .map((section) => ({
      section,
      items: fields.filter((field) => field.section === section),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <Box>
      <Box sx={{ textAlign: "center", mb: { xs: 3, md: 4 } }}>
        <Chip
          label="AI REVIEW"
          size="small"
          sx={{
            mb: 1.2,
            fontWeight: 800,
            color: "#1D4ED8",
            bgcolor: "#EEF4FF",
          }}
        />

        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            letterSpacing: "-0.02em",
            fontSize: { xs: "2rem", sm: "2.4rem", md: "2.8rem" },
          }}
        >
          Review information found
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            mt: 1,
            lineHeight: 1.7,
            maxWidth: 720,
            mx: "auto",
          }}
        >
          OsteoAI found candidate information in <strong>{fileName}</strong>.
          Review the values before continuing. Values marked “Review” can be
          confirmed and added to the assessment; values that need mapping
          stay out until you enter them manually.
        </Typography>
      </Box>

      <Alert severity="warning" icon={false} sx={{ mb: 2.5, borderRadius: 3 }}>
        <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
          Document extraction can be imperfect. “Review” means OsteoAI found a
          usable candidate but wants you to verify it. “Needs mapping” means
          the document wording does not yet match one of the assessment’s
          allowed choices, so OsteoAI will not guess for you.
        </Typography>
      </Alert>

      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          border: "1px solid #E2E8F0",
          bgcolor: "#FFFFFF",
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Stack spacing={3}>
            {groups.map((group, index) => (
              <Box key={group.section}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 800, color: "#0F172A", mb: 1.5 }}
                >
                  {sectionTitles[group.section]}
                </Typography>

                <Stack spacing={1.2}>
                  {group.items.map((field) => {
                    const status = getStatus(field.status);

                    return (
                      <Box
                        key={field.key}
                        sx={{
                          p: 1.5,
                          borderRadius: 3,
                          border: "1px solid #E2E8F0",
                          bgcolor: "#F8FAFC",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 1.5,
                            flexWrap: "wrap",
                            mb: 0.8,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 800, color: "#334155" }}
                          >
                            {field.label}
                          </Typography>

                          <Chip
                            size="small"
                            label={status.label}
                            sx={{
                              height: 24,
                              fontWeight: 700,
                              color: status.color,
                              bgcolor: status.bgcolor,
                            }}
                          />
                        </Box>

                        <Typography
                          sx={{
                            fontWeight: 700,
                            color: "#0F172A",
                            bgcolor: "#FFFFFF",
                            border: "1px solid #E2E8F0",
                            borderRadius: 2,
                            px: 1.5,
                            py: 1,
                          }}
                        >
                          {field.value === null || field.value === undefined || field.value === ""
                            ? "Not found"
                            : String(field.value)}
                        </Typography>

                        {field.source_text && (
                          <Typography
                            variant="caption"
                            sx={{ display: "block", mt: 0.8, color: "#64748B" }}
                          >
                            Source: {field.source_text}
                          </Typography>
                        )}
                      </Box>
                    );
                  })}
                </Stack>

                {index < groups.length - 1 && <Divider sx={{ mt: 3 }} />}
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Box
        sx={{
          mt: 2.2,
          p: 2,
          borderRadius: 3,
          bgcolor: "#F0F9FF",
          border: "1px solid #BAE6FD",
        }}
      >
        <Typography variant="body2" sx={{ color: "#075985", lineHeight: 1.7 }}>
          Found <strong>{result?.field_count_found ?? fields.length}</strong> candidate
          fields. Reference-only values such as BMI are shown for context and
          are not copied directly; values needing mapping must be entered using
          the assessment choices.
        </Typography>
      </Box>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 3 }}>
        <Button
          variant="outlined"
          onClick={onBack}
          sx={{
            flex: 1,
            py: 1.15,
            borderRadius: 2.5,
            textTransform: "none",
            fontWeight: 700,
          }}
        >
          Back to Document
        </Button>

        <Button
          variant="contained"
          onClick={onContinue}
          sx={{
            flex: 1,
            py: 1.15,
            borderRadius: 2.5,
            textTransform: "none",
            fontWeight: 800,
          }}
        >
          Confirm & Continue
        </Button>
      </Stack>
    </Box>
  );
}

export default AutofillReview;
