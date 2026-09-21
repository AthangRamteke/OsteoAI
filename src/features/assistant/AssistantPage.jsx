import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import SendIcon from "@mui/icons-material/Send";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import InsightsIcon from "@mui/icons-material/Insights";
import TimelineIcon from "@mui/icons-material/Timeline";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import HelpOutlineIcon from "@mui/icons-material/HelpOutlined";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import LockIcon from "@mui/icons-material/Lock";

import PageShell from "../../components/common/PageShell";
import useAgentChat from "./useAgentChat";
import {
  formatDate,
  getHistory,
  historyForAgent,
  probabilityPercent,
  riskColor,
  riskLevel,
} from "../../services/historyStore";

const NO_CONTEXT = "none";

/*
 * Assistant "skills": one-tap tasks that turn into a well-formed
 * prompt. `needs` marks what context a skill requires.
 */
const SKILLS = [
  {
    id: "explain",
    icon: <InsightsIcon />,
    title: "Explain my result",
    description: "Probability, risk level and SHAP factors in plain words.",
    prompt: "Explain my result.",
    needs: "result",
  },
  {
    id: "progress",
    icon: <TimelineIcon />,
    title: "Track my progress",
    description: "How your estimate changed across assessments.",
    prompt: "How has my risk estimate changed across my assessments?",
    needs: "history",
  },
  {
    id: "doctor",
    icon: <LocalHospitalIcon />,
    title: "Doctor visit prep",
    description: "Questions to take to your next appointment.",
    prompt:
      "Based on my result, list 4 short questions I could ask my doctor about my bone health. Write only the questions, one per line, each starting with \"- \" and ending with \"?\".",
    needs: "result",
  },
  {
    id: "habits",
    icon: <DirectionsWalkIcon />,
    title: "Bone-healthy habits",
    description: "General habits relevant to your factors.",
    prompt:
      "Suggest 3 simple, general bone-healthy habits that relate to the factors in my result.",
    needs: "result",
  },
  {
    id: "fields",
    icon: <HelpOutlineIcon />,
    title: "Assessment help",
    description: "What a question means and why it is asked.",
    prompt: "What does sedentary time mean in the assessment, and why is it asked?",
  },
  {
    id: "learn",
    icon: <MenuBookIcon />,
    title: "Learn the basics",
    description: "Osteoporosis, DEXA scans, T-scores and more.",
    prompt: "What is a DEXA scan and when is it recommended?",
  },
];

const STARTERS = [
  "Why is my risk level what it is?",
  "What is osteoporosis?",
  "Does calcium alone protect bones?",
  "Open my assessment history",
];

function MessageBubble({ message }) {
  const isAssistant = message.role === "assistant";

  return (
    <Stack
      direction="row"
      spacing={1.25}
      sx={{ justifyContent: isAssistant ? "flex-start" : "flex-end", alignItems: "flex-start" }}
    >
      {isAssistant && (
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
            background: "linear-gradient(135deg, #2563EB, #14B8A6)",
          }}
        >
          <SmartToyIcon sx={{ fontSize: 18 }} />
        </Box>
      )}

      <Box
        sx={{
          maxWidth: { xs: "88%", md: "75%" },
          px: 2,
          py: 1.4,
          borderRadius: 3,
          borderTopLeftRadius: isAssistant ? 6 : 24,
          borderTopRightRadius: isAssistant ? 24 : 6,
          bgcolor: isAssistant ? "#FFFFFF" : "#2563EB",
          color: isAssistant ? "#334155" : "#FFFFFF",
          border: isAssistant ? "1px solid #E2E8F0" : "none",
          boxShadow: isAssistant ? "0 4px 14px rgba(15,23,42,0.04)" : "none",
        }}
      >
        <Typography variant="body2" sx={{ lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
          {message.content}
          {message.streaming && (
            <Box
              component="span"
              sx={{
                display: "inline-block",
                width: 7,
                height: 14,
                ml: 0.5,
                bgcolor: "#2563EB",
                verticalAlign: "middle",
                animation: "osteoBlink 1s steps(2) infinite",
                "@keyframes osteoBlink": { "50%": { opacity: 0 } },
              }}
            />
          )}
        </Typography>
      </Box>
    </Stack>
  );
}

function AssistantPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const history = useMemo(() => getHistory(), []);

  const [contextId, setContextId] = useState(
    () => searchParams.get("record") || history[0]?.id || NO_CONTEXT
  );
  const [input, setInput] = useState("");

  const selectedRecord = history.find((record) => record.id === contextId) || null;

  const getContext = useCallback(
    () => ({
      predictionResult: selectedRecord?.predictionResult || {},
      assessmentHistory: historyForAgent(history),
    }),
    [selectedRecord, history]
  );

  const { messages, loading, error, send, reset } = useAgentChat(getContext);

  // Questions handed over from other pages (?q=...), sent once.
  const handedOver = useRef(false);

  useEffect(() => {
    const question = searchParams.get("q");

    if (question && !handedOver.current) {
      handedOver.current = true;
      setSearchParams({}, { replace: true });
      send(question);
    }
  }, [searchParams, setSearchParams, send]);

  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const submit = () => {
    send(input);
    setInput("");
  };

  const skillAvailable = (skill) =>
    (skill.needs !== "result" || selectedRecord) &&
    (skill.needs !== "history" || history.length > 1);

  const level = selectedRecord ? riskLevel(selectedRecord) : null;
  const lastMessage = messages[messages.length - 1];

  return (
    <PageShell
      icon={<AutoAwesomeIcon />}
      title="AI Assistant"
      subtitle="Your private bone-health companion, running on a local AI model."
      actions={
        <Chip
          icon={<LockIcon sx={{ fontSize: 16 }} />}
          label="Local AI · Qwen3.5"
          sx={{ fontWeight: 700, bgcolor: "#ECFDF5", color: "#047857" }}
        />
      }
    >
      <Grid container spacing={3}>
        {/* ---------------- Context + skills ---------------- */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2.5}>
            <Card sx={{ p: 2.5, borderRadius: 4, border: "1px solid #E2E8F0", boxShadow: "none" }}>
              <Typography sx={{ fontWeight: 800, color: "#0F172A" }}>
                Assistant is looking at
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748B", mb: 1.5 }}>
                The assessment it uses to answer personal questions.
              </Typography>

              <TextField
                select
                fullWidth
                size="small"
                value={contextId}
                onChange={(event) => setContextId(event.target.value)}
              >
                {history.map((record, index) => (
                  <MenuItem key={record.id} value={record.id}>
                    {formatDate(record.savedAt)} · {probabilityPercent(record)?.toFixed(1)}%
                    {index === 0 ? " (latest)" : ""}
                  </MenuItem>
                ))}
                <MenuItem value={NO_CONTEXT}>No assessment (general questions)</MenuItem>
              </TextField>

              {selectedRecord ? (
                <Box
                  sx={{
                    mt: 2,
                    p: 1.75,
                    borderRadius: 3,
                    bgcolor: riskColor(level).soft,
                  }}
                >
                  <Typography sx={{ fontWeight: 800, color: riskColor(level).main, fontSize: 22 }}>
                    {probabilityPercent(selectedRecord)?.toFixed(1)}% · {level} risk
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#475569" }}>
                    Model estimate, not a diagnosis
                  </Typography>
                </Box>
              ) : (
                history.length === 0 && (
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate("/assessment")}
                    sx={{ mt: 2, textTransform: "none", fontWeight: 700, borderRadius: 3 }}
                  >
                    Take an assessment for personal answers
                  </Button>
                )
              )}
            </Card>

            <Box>
              <Typography sx={{ fontWeight: 800, color: "#0F172A", mb: 1.25 }}>
                Skills
              </Typography>

              <Grid container spacing={1.25}>
                {SKILLS.map((skill) => {
                  const available = skillAvailable(skill);

                  return (
                    <Grid key={skill.id} size={{ xs: 6, md: 12, lg: 6 }}>
                      <Tooltip
                        title={
                          available
                            ? ""
                            : skill.needs === "history"
                              ? "Needs at least two saved assessments"
                              : "Select an assessment first"
                        }
                      >
                        <Card
                          onClick={() => available && !loading && send(skill.prompt)}
                          sx={{
                            p: 1.75,
                            height: "100%",
                            borderRadius: 3,
                            border: "1px solid #E2E8F0",
                            boxShadow: "none",
                            cursor: available ? "pointer" : "not-allowed",
                            opacity: available ? 1 : 0.5,
                            transition: "all 0.2s",
                            "&:hover": available
                              ? { borderColor: "#93C5FD", transform: "translateY(-2px)" }
                              : {},
                          }}
                        >
                          <Box sx={{ color: "#2563EB", mb: 0.5 }}>{skill.icon}</Box>
                          <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#0F172A" }}>
                            {skill.title}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#64748B" }}>
                            {skill.description}
                          </Typography>
                        </Card>
                      </Tooltip>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          </Stack>
        </Grid>

        {/* ---------------- Chat ---------------- */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card
            sx={{
              borderRadius: 4,
              border: "1px solid #E2E8F0",
              boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
              display: "flex",
              flexDirection: "column",
              height: { xs: 560, md: 640 },
            }}
          >
            <Stack
              direction="row"
              sx={{
                px: 2.5,
                py: 1.5,
                borderBottom: "1px solid #F1F5F9",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Box
                  sx={{
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    bgcolor: loading ? "#F59E0B" : "#22C55E",
                  }}
                />
                <Typography sx={{ fontWeight: 700, color: "#0F172A" }}>
                  OsteoAI Assistant
                </Typography>
                <Typography variant="caption" sx={{ color: "#94A3B8" }}>
                  {loading ? "thinking…" : "ready"}
                </Typography>
              </Stack>

              <Tooltip title="New conversation">
                <span>
                  <IconButton onClick={reset} disabled={loading || !messages.length}>
                    <RestartAltIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>

            <Box
              ref={scrollRef}
              sx={{ flex: 1, overflowY: "auto", px: { xs: 2, md: 3 }, py: 2.5, bgcolor: "#F8FAFC" }}
            >
              {!messages.length ? (
                <Stack sx={{ height: "100%", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 4,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#FFFFFF",
                      background: "linear-gradient(135deg, #2563EB, #14B8A6)",
                      mb: 2,
                    }}
                  >
                    <AutoAwesomeIcon fontSize="large" />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: "#0F172A" }}>
                    How can I help with your bone health?
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748B", maxWidth: 420, mt: 0.5, mb: 2.5 }}>
                    Ask about your result, osteoporosis, the assessment, or where to find
                    something in OsteoAI. Pick a skill on the left for a quick start.
                  </Typography>
                  <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
                    {STARTERS.map((starter) => (
                      <Chip
                        key={starter}
                        label={starter}
                        onClick={() => send(starter)}
                        variant="outlined"
                        sx={{ fontWeight: 600, bgcolor: "#FFFFFF" }}
                      />
                    ))}
                  </Stack>
                </Stack>
              ) : (
                <Stack spacing={2}>
                  {messages.map((message, index) => (
                    <MessageBubble key={`${message.role}-${index}`} message={message} />
                  ))}

                  {loading && lastMessage?.role === "user" && (
                    <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
                      <CircularProgress size={18} />
                      <Typography variant="caption" sx={{ color: "#94A3B8" }}>
                        Thinking…
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              )}
            </Box>

            {error && (
              <Alert severity="error" sx={{ mx: 2.5, mt: 1.5, borderRadius: 3 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ p: 2, borderTop: "1px solid #F1F5F9" }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "flex-end" }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  size="small"
                  placeholder="Ask anything about bone health or your result…"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      submit();
                    }
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                />
                <IconButton
                  color="primary"
                  onClick={submit}
                  disabled={loading || !input.trim()}
                  sx={{
                    bgcolor: "#2563EB",
                    color: "#FFFFFF",
                    "&:hover": { bgcolor: "#1D4ED8" },
                    "&.Mui-disabled": { bgcolor: "#E2E8F0" },
                  }}
                >
                  <SendIcon />
                </IconButton>
              </Stack>
              <Typography variant="caption" sx={{ display: "block", color: "#94A3B8", mt: 1 }}>
                Educational information and a prototype risk estimate, not a medical
                diagnosis. In an emergency call 112.
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </PageShell>
  );
}

export default AssistantPage;
