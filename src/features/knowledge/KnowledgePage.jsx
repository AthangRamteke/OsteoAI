import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import MenuBookIcon from "@mui/icons-material/MenuBook";
import SearchIcon from "@mui/icons-material/Search";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import EmergencyIcon from "@mui/icons-material/Emergency";
import QuizIcon from "@mui/icons-material/Quiz";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import SpellcheckIcon from "@mui/icons-material/Spellcheck";

import PageShell from "../../components/common/PageShell";
import { useLanguage } from "../../context/LanguageContext";
import { fetchKnowledge } from "../../services/knowledgeService";

const CATEGORY_COLORS = {
  basics: "#2563EB",
  risk: "#DC2626",
  testing: "#7C3AED",
  lifestyle: "#16A34A",
  result: "#0891B2",
  app: "#D97706",
};

const cardSx = {
  borderRadius: 4,
  border: "1px solid #E2E8F0",
  boxShadow: "none",
};

function SectionTitle({ icon, title, subtitle }) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 2 }}>
      <Box sx={{ color: "#2563EB", display: "flex" }}>{icon}</Box>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 800, color: "#0F172A", lineHeight: 1.2 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ color: "#64748B" }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

/* Click to reveal: guess first, then see the fact. */
function MythCard({ item }) {
  const { t } = useLanguage();
  const [revealed, setRevealed] = useState(false);

  return (
    <Card
      onClick={() => setRevealed((value) => !value)}
      sx={{
        ...cardSx,
        p: 2.25,
        height: "100%",
        cursor: "pointer",
        bgcolor: revealed ? "#F0FDF4" : "#FFFFFF",
        borderColor: revealed ? "#BBF7D0" : "#E2E8F0",
        transition: "all 0.25s",
        "&:hover": { transform: "translateY(-2px)" },
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
        {revealed ? (
          <CheckCircleIcon sx={{ color: "#16A34A" }} fontSize="small" />
        ) : (
          <CancelIcon sx={{ color: "#DC2626" }} fontSize="small" />
        )}
        <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: 0.6, color: revealed ? "#15803D" : "#B91C1C" }}>
          {revealed ? t("knowledge.factLabel") : t("knowledge.mythLabel")}
        </Typography>
      </Stack>

      <Typography sx={{ fontWeight: revealed ? 500 : 700, color: "#0F172A", fontSize: 15 }}>
        {revealed ? item.fact : `“${item.myth}”`}
      </Typography>

      <Typography variant="caption" sx={{ display: "block", color: "#94A3B8", mt: 1.5 }}>
        {revealed ? t("knowledge.tapToSeeMythAgain") : t("knowledge.tapToRevealFact")}
      </Typography>
    </Card>
  );
}

function KnowledgePage() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const [content, setContent] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [openArticle, setOpenArticle] = useState(null);

  useEffect(() => {
    setLoadError("");
    fetchKnowledge(language)
      .then(setContent)
      .catch((error) => setLoadError(error.message));
  }, [language]);

  const askAI = (question) =>
    navigate(`/assistant?q=${encodeURIComponent(question)}`);

  const articles = useMemo(() => {
    if (!content) {
      return [];
    }

    const words = query.toLowerCase().split(/\s+/).filter(Boolean);

    return content.articles.filter((article) => {
      if (category !== "all" && article.category !== category) {
        return false;
      }

      const haystack = [article.title, article.summary, ...article.tags, ...article.body]
        .join(" ")
        .toLowerCase();

      return words.every((word) => haystack.includes(word));
    });
  }, [content, query, category]);

  const categoryLabel = (id) =>
    content?.categories.find((item) => item.id === id)?.label || id;

  const relatedArticles = openArticle
    ? content.articles
        .filter((item) => item.category === openArticle.category && item.id !== openArticle.id)
        .slice(0, 2)
    : [];

  if (loadError) {
    return (
      <PageShell icon={<MenuBookIcon />} title={t("knowledge.pageTitle")} subtitle={t("knowledge.pageSubtitle")}>
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {t("knowledge.loadError")}
        </Alert>
      </PageShell>
    );
  }

  return (
    <PageShell
      icon={<MenuBookIcon />}
      title={t("knowledge.pageTitle")}
      subtitle={t("knowledge.pageSubtitle")}
    >
      {!content ? (
        <Stack sx={{ alignItems: "center", py: 8 }}>
          <CircularProgress />
        </Stack>
      ) : (
        <Stack spacing={5}>
          {/* ---------------- Search + library ---------------- */}
          <Box>
            <TextField
              fullWidth
              placeholder={t("knowledge.searchPlaceholder")}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: 4, bgcolor: "#FFFFFF", fontSize: 16 },
              }}
            />

            <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1, mt: 2 }}>
              {[{ id: "all", label: t("knowledge.allTopicsLabel") }, ...content.categories].map((item) => {
                const active = category === item.id;
                const color = CATEGORY_COLORS[item.id] || "#2563EB";

                return (
                  <Chip
                    key={item.id}
                    label={item.label}
                    onClick={() => setCategory(item.id)}
                    sx={{
                      fontWeight: 700,
                      color: active ? "#FFFFFF" : color,
                      bgcolor: active ? color : `${color}14`,
                      "&:hover": { bgcolor: active ? color : `${color}24` },
                    }}
                  />
                );
              })}
            </Stack>

            <Grid container spacing={2} sx={{ mt: 1 }}>
              {articles.map((article) => {
                const color = CATEGORY_COLORS[article.category] || "#2563EB";

                return (
                  <Grid key={article.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card
                      onClick={() => setOpenArticle(article)}
                      sx={{
                        ...cardSx,
                        p: 2.5,
                        height: "100%",
                        cursor: "pointer",
                        borderTop: `4px solid ${color}`,
                        transition: "all 0.2s",
                        "&:hover": { transform: "translateY(-3px)", boxShadow: "0 12px 28px rgba(15,23,42,0.07)" },
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 800, color, letterSpacing: 0.4 }}>
                        {categoryLabel(article.category).toUpperCase()}
                      </Typography>
                      <Typography sx={{ fontWeight: 800, color: "#0F172A", mt: 0.5, mb: 0.75 }}>
                        {article.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#64748B" }}>
                        {article.summary}
                      </Typography>
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", color: "#94A3B8", mt: 1.5 }}>
                        <AccessTimeIcon sx={{ fontSize: 15 }} />
                        <Typography variant="caption">
                          {t("knowledge.readMinutes", { count: article.readMinutes })}
                        </Typography>
                      </Stack>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>

            {!articles.length && (
              <Card sx={{ ...cardSx, p: 3, mt: 2, textAlign: "center", bgcolor: "#EFF6FF", borderColor: "#BFDBFE" }}>
                <Typography sx={{ fontWeight: 700, color: "#0F172A" }}>
                  {t("knowledge.noArticlesMatch", { query })}
                </Typography>
                <Typography variant="body2" sx={{ color: "#475569", mt: 0.5, mb: 2 }}>
                  {t("knowledge.aiCanAnswer")}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AutoAwesomeIcon />}
                  onClick={() => askAI(query)}
                  sx={{ textTransform: "none", fontWeight: 700, boxShadow: "none", borderRadius: 3 }}
                >
                  {t("knowledge.askAiAssistantButton")}
                </Button>
              </Card>
            )}
          </Box>

          {/* ---------------- Myth or fact ---------------- */}
          <Box>
            <SectionTitle
              icon={<QuizIcon />}
              title={t("knowledge.mythOrFactTitle")}
              subtitle={t("knowledge.mythOrFactSubtitle")}
            />
            <Grid container spacing={2}>
              {content.myths.map((item) => (
                <Grid key={item.myth} size={{ xs: 12, sm: 6, md: 4 }}>
                  <MythCard item={item} />
                </Grid>
              ))}
            </Grid>
          </Box>

          <Grid container spacing={3}>
            {/* ---------------- FAQ ---------------- */}
            <Grid size={{ xs: 12, md: 7 }}>
              <SectionTitle icon={<SupportAgentIcon />} title={t("knowledge.faqTitle")} />
              {content.faqs.map((faq) => (
                <Accordion
                  key={faq.question}
                  disableGutters
                  elevation={0}
                  sx={{
                    border: "1px solid #E2E8F0",
                    borderRadius: "12px !important",
                    mb: 1.25,
                    "&:before": { display: "none" },
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ fontWeight: 700, color: "#0F172A" }}>{faq.question}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" sx={{ color: "#475569", lineHeight: 1.7 }}>
                      {faq.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Grid>

            {/* ---------------- Glossary ---------------- */}
            <Grid size={{ xs: 12, md: 5 }}>
              <SectionTitle icon={<SpellcheckIcon />} title={t("knowledge.glossaryTitle")} />
              <Card sx={{ ...cardSx, p: 1 }}>
                {content.glossary.map((entry, index) => (
                  <Box
                    key={entry.term}
                    sx={{
                      px: 1.75,
                      py: 1.25,
                      borderBottom:
                        index < content.glossary.length - 1 ? "1px solid #F1F5F9" : "none",
                    }}
                  >
                    <Typography sx={{ fontWeight: 800, color: "#2563EB", fontSize: 14 }}>
                      {entry.term}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#475569" }}>
                      {entry.definition}
                    </Typography>
                  </Box>
                ))}
              </Card>
            </Grid>
          </Grid>

          {/* ---------------- Support ---------------- */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Card
                sx={{
                  ...cardSx,
                  p: 3,
                  height: "100%",
                  color: "#FFFFFF",
                  border: "none",
                  background: "linear-gradient(135deg, #2563EB, #14B8A6)",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {t("knowledge.stillHaveQuestionTitle")}
                </Typography>
                <Typography sx={{ opacity: 0.9, mt: 0.5, mb: 2 }}>
                  {t("knowledge.stillHaveQuestionDesc")}
                </Typography>
                <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap", gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<AutoAwesomeIcon />}
                    onClick={() => navigate("/assistant")}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      bgcolor: "#FFFFFF",
                      color: "#2563EB",
                      boxShadow: "none",
                      "&:hover": { bgcolor: "#EFF6FF" },
                    }}
                  >
                    {t("knowledge.openAiAssistantButton")}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/assessment")}
                    sx={{ textTransform: "none", fontWeight: 700, color: "#FFFFFF", borderColor: "rgba(255,255,255,0.6)" }}
                  >
                    {t("knowledge.takeAssessmentButton")}
                  </Button>
                </Stack>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ ...cardSx, p: 3, height: "100%", bgcolor: "#FEF2F2", borderColor: "#FECACA" }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", color: "#B91C1C" }}>
                  <EmergencyIcon />
                  <Typography sx={{ fontWeight: 800 }}>{t("knowledge.importantLabel")}</Typography>
                </Stack>
                <Typography variant="body2" sx={{ color: "#7F1D1D", mt: 1, lineHeight: 1.7 }}>
                  {content.support.disclaimer}
                </Typography>
                {content.support.contact && (
                  <Typography variant="body2" sx={{ color: "#7F1D1D", mt: 1, fontWeight: 700 }}>
                    {t("knowledge.contactLabel", { value: content.support.contact })}
                  </Typography>
                )}
              </Card>
            </Grid>
          </Grid>
        </Stack>
      )}

      {/* ---------------- Article reader ---------------- */}
      <Dialog open={Boolean(openArticle)} onClose={() => setOpenArticle(null)} maxWidth="sm" fullWidth>
        {openArticle && (
          <>
            <Box
              sx={{
                px: 3,
                pt: 3,
                pb: 2,
                borderTop: `5px solid ${CATEGORY_COLORS[openArticle.category] || "#2563EB"}`,
              }}
            >
              <Typography
                variant="caption"
                sx={{ fontWeight: 800, color: CATEGORY_COLORS[openArticle.category], letterSpacing: 0.4 }}
              >
                {categoryLabel(openArticle.category).toUpperCase()} · {openArticle.readMinutes} {t("knowledge.minReadUpper")}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#0F172A", mt: 0.5 }}>
                {openArticle.title}
              </Typography>
            </Box>
            <DialogContent sx={{ pt: 0 }}>
              {openArticle.body.map((paragraph) => (
                <Typography key={paragraph} sx={{ color: "#334155", lineHeight: 1.8, mb: 1.75 }}>
                  {paragraph}
                </Typography>
              ))}

              {relatedArticles.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: "#0F172A", mb: 1 }}>
                    {t("knowledge.relatedLabel")}
                  </Typography>
                  <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
                    {relatedArticles.map((item) => (
                      <Chip key={item.id} label={item.title} onClick={() => setOpenArticle(item)} />
                    ))}
                  </Stack>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5, justifyContent: "space-between" }}>
              <Button onClick={() => setOpenArticle(null)} sx={{ textTransform: "none" }}>
                {t("common.close")}
              </Button>
              <Button
                variant="contained"
                startIcon={<AutoAwesomeIcon />}
                onClick={() => askAI(`Tell me more about: ${openArticle.title}`)}
                sx={{ textTransform: "none", fontWeight: 700, boxShadow: "none", borderRadius: 3 }}
              >
                {t("knowledge.askFollowUpButton")}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </PageShell>
  );
}

export default KnowledgePage;
