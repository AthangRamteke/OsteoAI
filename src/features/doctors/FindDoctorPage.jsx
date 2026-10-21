import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";

import ExploreOutlinedIcon from "@mui/icons-material/ExploreOutlined";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import SearchIcon from "@mui/icons-material/Search";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";

import PageShell from "../../components/common/PageShell";
import { useLanguage } from "../../context/LanguageContext";
import { fetchNearbyHospitals } from "../../services/doctorService";
import HospitalCard from "./HospitalCard";
import HospitalMap from "./HospitalMap";

const PIN_PATTERN = /^[1-9][0-9]{5}$/;

const FILTERS = [
  { id: "all", labelKey: "doctors.filterAll", test: () => true },
  {
    id: "specialist",
    labelKey: "doctors.filterSpecialist",
    test: (hospital) => hospital.specialist,
  },
  {
    id: "hospital",
    labelKey: "doctors.filterHospital",
    test: (hospital) => hospital.category === "hospital",
  },
];

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({ code: "unsupported" });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }),
      (error) =>
        reject({ code: error.code === 1 ? "denied" : "unavailable" }),
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 5 * 60 * 1000 }
    );
  });
}

function SearchPanel({ busy, compact, locating, onUseLocation, onSearchText, notice }) {
  const { t } = useLanguage();

  const [text, setText] = useState("");
  const [touched, setTouched] = useState(false);

  const value = text.trim();
  const valid = PIN_PATTERN.test(value) || (value.length >= 2 && !/^\d+$/.test(value));
  const showError = touched && value !== "" && !valid;

  const submit = (event) => {
    event.preventDefault();
    setTouched(true);

    if (valid) {
      onSearchText(value);
    }
  };

  if (compact) {
    return (
      <Card
        sx={{
          p: { xs: 2, md: 2.25 },
          borderRadius: 4,
          border: "1px solid var(--oa-border-1)",
          boxShadow: "var(--oa-shadow-card)",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 1.5, md: 2 }}
          sx={{ alignItems: { md: "center" } }}
        >
          <Button
            variant="contained"
            disabled={busy}
            onClick={onUseLocation}
            startIcon={
              locating ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <MyLocationIcon />
              )
            }
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 2.5,
              boxShadow: "none",
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            {locating ? t("doctors.locating") : t("doctors.useLocation")}
          </Button>

          <Typography
            variant="body2"
            sx={{ color: "var(--oa-text-400)", display: { xs: "none", md: "block" } }}
          >
            {t("doctors.or")}
          </Typography>

          <Box component="form" onSubmit={submit} noValidate sx={{ flex: 1, width: "100%" }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
              <TextField
                fullWidth
                size="small"
                label={t("doctors.pinLabel")}
                placeholder={t("doctors.pinPlaceholder")}
                value={text}
                disabled={busy}
                onChange={(event) => setText(event.target.value)}
                onBlur={() => setTouched(true)}
                error={showError}
                helperText={showError ? t("doctors.pinInvalid") : undefined}
                autoComplete="postal-code"
                slotProps={{ htmlInput: { maxLength: 40 } }}
              />

              <Button
                type="submit"
                variant="outlined"
                disabled={busy || value === ""}
                startIcon={<SearchIcon />}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: 2,
                  height: 40,
                  flexShrink: 0,
                }}
              >
                {t("doctors.searchButton")}
              </Button>
            </Stack>
          </Box>
        </Stack>

        {notice && (
          <Alert severity={notice.severity} sx={{ mt: 2, borderRadius: 2.5 }}>
            {notice.text}
          </Alert>
        )}
      </Card>
    );
  }

  return (
    <Card
      sx={{
        p: { xs: 2.5, md: 3.5 },
        borderRadius: 4,
        border: "1px solid var(--oa-border-1)",
        boxShadow: "var(--oa-shadow-card)",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={{ xs: 3, md: 4 }}
        divider={
          <Divider
            flexItem
            orientation="vertical"
            sx={{ display: { xs: "none", md: "block" } }}
          />
        }
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "var(--oa-text-900)" }}>
            {t("doctors.searchTitle")}
          </Typography>
          <Typography sx={{ color: "var(--oa-text-500)", mt: 0.5, mb: 2.5 }}>
            {t("doctors.searchDesc")}
          </Typography>

          <Button
            variant="contained"
            size="large"
            disabled={busy}
            onClick={onUseLocation}
            startIcon={
              locating ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <MyLocationIcon />
              )
            }
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 3,
              boxShadow: "none",
              px: 3,
            }}
          >
            {locating ? t("doctors.locating") : t("doctors.useLocation")}
          </Button>

          <Stack direction="row" spacing={0.75} sx={{ mt: 2, alignItems: "center" }}>
            <LockOutlinedIcon sx={{ fontSize: 16, color: "var(--oa-text-400)" }} />
            <Typography variant="caption" sx={{ color: "var(--oa-text-500)" }}>
              {t("doctors.privacyNote")}
            </Typography>
          </Stack>
        </Box>

        <Box component="form" onSubmit={submit} noValidate sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 700, color: "var(--oa-text-900)" }}>
            {t("doctors.pinTitle")}
          </Typography>
          <Typography variant="body2" sx={{ color: "var(--oa-text-500)", mt: 0.5, mb: 2 }}>
            {t("doctors.pinDesc")}
          </Typography>

          <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
            <TextField
              fullWidth
              size="small"
              label={t("doctors.pinLabel")}
              placeholder={t("doctors.pinPlaceholder")}
              value={text}
              disabled={busy}
              onChange={(event) => setText(event.target.value)}
              onBlur={() => setTouched(true)}
              error={showError}
              helperText={showError ? t("doctors.pinInvalid") : " "}
              autoComplete="postal-code"
              slotProps={{ htmlInput: { maxLength: 40 } }}
            />

            <Button
              type="submit"
              variant="outlined"
              disabled={busy || value === ""}
              startIcon={<SearchIcon />}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 2,
                height: 40,
                flexShrink: 0,
              }}
            >
              {t("doctors.searchButton")}
            </Button>
          </Stack>
        </Box>
      </Stack>

      {notice && (
        <Alert severity={notice.severity} sx={{ mt: 2.5, borderRadius: 2.5 }}>
          {notice.text}
        </Alert>
      )}
    </Card>
  );
}

function ListSkeleton() {
  return (
    <Stack spacing={1.5}>
      {[0, 1, 2, 3].map((index) => (
        <Skeleton key={index} variant="rounded" height={104} sx={{ borderRadius: 3 }} />
      ))}
    </Stack>
  );
}

function IntroState() {
  const { t } = useLanguage();

  return (
    <Box
      sx={{
        mt: 3,
        p: { xs: 3, md: 5 },
        textAlign: "center",
        borderRadius: 4,
        border: "1px dashed var(--oa-border-4)",
        color: "var(--oa-text-500)",
      }}
    >
      <TravelExploreIcon sx={{ fontSize: 44, color: "var(--oa-brand-200)" }} />
      <Typography sx={{ fontWeight: 800, color: "var(--oa-text-900)", mt: 1 }}>
        {t("doctors.introTitle")}
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.5, maxWidth: 460, mx: "auto" }}>
        {t("doctors.introDesc")}
      </Typography>
    </Box>
  );
}

/*
 * Find a Doctor.
 *
 * Lists orthopedic and bone-care facilities near the user, from
 * OpenStreetMap, and lets them open any of them in a map app. A device
 * location gives the most accurate results; a PIN code (or city) is the
 * fallback for people who would rather not share their location.
 */
function FindDoctorPage() {
  const { t } = useLanguage();
  const isDesktop = useMediaQuery("(min-width:900px)");

  const [phase, setPhase] = useState("idle"); // idle | locating | loading | ready | error
  const [notice, setNotice] = useState(null);
  const [errorText, setErrorText] = useState("");
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [mobileView, setMobileView] = useState("list");

  const abortRef = useRef(null);
  const lastRequestRef = useRef(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const runSearch = useCallback(async (request) => {
    abortRef.current?.abort();

    const controller = new AbortController();
    abortRef.current = controller;
    lastRequestRef.current = request;

    setPhase("loading");
    setNotice(null);
    setErrorText("");
    setSelectedId(null);
    setFilter("all");

    try {
      const result = await fetchNearbyHospitals({
        ...request,
        signal: controller.signal,
      });

      setData(result);
      setPhase("ready");
      setMobileView("list");
    } catch (error) {
      if (error.name === "AbortError") {
        return;
      }

      setErrorText(error.message);
      setPhase("error");
    }
  }, []);

  const handleUseLocation = async () => {
    setPhase("locating");
    setNotice(null);

    try {
      const position = await getCurrentPosition();
      await runSearch(position);
    } catch (error) {
      setPhase(data ? "ready" : "idle");
      setNotice({
        severity: "info",
        text: t(
          {
            denied: "doctors.locationDenied",
            unsupported: "doctors.locationUnsupported",
          }[error.code] || "doctors.locationUnavailable"
        ),
      });
    }
  };

  const handleSearchText = (value) => {
    runSearch(PIN_PATTERN.test(value) ? { pincode: value } : { query: value });
  };

  const results = useMemo(() => data?.results ?? [], [data]);

  const visible = useMemo(() => {
    const active = FILTERS.find((item) => item.id === filter) || FILTERS[0];

    return results.filter(active.test);
  }, [results, filter]);

  const counts = useMemo(
    () =>
      Object.fromEntries(
        FILTERS.map((item) => [item.id, results.filter(item.test).length])
      ),
    [results]
  );

  const handleSelect = useCallback(
    (id) => {
      setSelectedId((current) => (current === id ? null : id));
    },
    []
  );

  // Bring the chosen card into view when it is picked from the map.
  useEffect(() => {
    if (!selectedId || !isDesktop) {
      return;
    }

    document
      .getElementById(`hospital-${selectedId.replace("/", "-")}`)
      ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedId, isDesktop]);

  const busy = phase === "locating" || phase === "loading";
  const place = data?.origin.label || t("doctors.yourLocation");

  const list = (
    <Stack spacing={1.25}>
      {visible.length === 0 ? (
        <Typography sx={{ color: "var(--oa-text-500)", py: 3, textAlign: "center" }}>
          {t("doctors.noFilterResults")}
        </Typography>
      ) : (
        visible.map((hospital) => (
          <HospitalCard
            key={hospital.id}
            hospital={hospital}
            origin={data.origin}
            selected={hospital.id === selectedId}
            onSelect={(id) => {
              handleSelect(id);
            }}
          />
        ))
      )}
    </Stack>
  );

  const map =
    data && visible.length > 0 ? (
      <HospitalMap
        origin={data.origin}
        hospitals={visible}
        selectedId={selectedId}
        label={t("doctors.mapLabel")}
        onSelect={(id) => {
          setSelectedId(id);
          if (!isDesktop) {
            setMobileView("list");
          }
        }}
      />
    ) : null;

  return (
    <PageShell
      maxWidth="xl"
      icon={<LocalHospitalIcon />}
      title={t("doctors.pageTitle")}
      subtitle={t("doctors.pageSubtitle")}
    >
      <SearchPanel
        busy={busy}
        compact={phase === "ready" || phase === "loading" || phase === "error"}
        locating={phase === "locating"}
        onUseLocation={handleUseLocation}
        onSearchText={handleSearchText}
        notice={notice}
      />

      {phase === "idle" && <IntroState />}

      {phase === "error" && (
        <Alert
          severity="error"
          sx={{ mt: 3, borderRadius: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => runSearch(lastRequestRef.current)}
              sx={{ textTransform: "none", fontWeight: 700 }}
            >
              {t("doctors.retry")}
            </Button>
          }
        >
          {errorText}
        </Alert>
      )}

      {phase === "loading" && (
        <Box sx={{ mt: 3 }}>
          <Typography sx={{ color: "var(--oa-text-500)", fontWeight: 600, mb: 1.5 }}>
            {t("doctors.searching")}
          </Typography>
          <ListSkeleton />
        </Box>
      )}

      {phase === "ready" && data && (
        <Box sx={{ mt: 3 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{
              justifyContent: "space-between",
              alignItems: { sm: "center" },
              mb: 2,
            }}
          >
            <Box>
              <Typography sx={{ fontWeight: 800, color: "var(--oa-text-900)" }}>
                {t("doctors.resultsSummary", {
                  count: results.length,
                  radius: data.radius_km,
                  place,
                })}
              </Typography>

              {data.widened && (
                <Typography variant="body2" sx={{ color: "var(--oa-text-500)" }}>
                  {t("doctors.widened", { radius: data.radius_km })}
                </Typography>
              )}
            </Box>

            <Stack direction="row" sx={{ gap: 0.75, flexWrap: "wrap" }}>
              {FILTERS.map((item) => {
                const active = filter === item.id;

                return (
                  <Chip
                    key={item.id}
                    clickable
                    onClick={() => {
                      setFilter(item.id);
                      setSelectedId(null);
                    }}
                    label={`${t(item.labelKey)} (${counts[item.id]})`}
                    sx={{
                      fontWeight: 700,
                      color: active ? "#FFFFFF" : "var(--oa-brand)",
                      bgcolor: active ? "var(--oa-brand-solid)" : "var(--oa-brand-soft)",
                      "&:hover": {
                        bgcolor: active ? "var(--oa-brand-solid-strong)" : "var(--oa-brand-soft-2)",
                      },
                    }}
                  />
                );
              })}
            </Stack>
          </Stack>

          {results.length === 0 ? (
            <Box
              sx={{
                p: { xs: 3, md: 5 },
                textAlign: "center",
                borderRadius: 4,
                border: "1px solid var(--oa-border-1)",
                bgcolor: "var(--oa-surface)",
              }}
            >
              <ExploreOutlinedIcon sx={{ fontSize: 44, color: "var(--oa-text-400)" }} />
              <Typography sx={{ fontWeight: 800, color: "var(--oa-text-900)", mt: 1 }}>
                {t("doctors.emptyTitle")}
              </Typography>
              <Typography variant="body2" sx={{ color: "var(--oa-text-500)", mt: 0.5 }}>
                {t("doctors.emptyDesc")}
              </Typography>
            </Box>
          ) : isDesktop ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "minmax(380px, 5fr) 7fr",
                gap: 2.5,
                alignItems: "start",
              }}
            >
              <Box
                sx={{
                  maxHeight: "calc(100vh - 220px)",
                  minHeight: 480,
                  overflowY: "auto",
                  pr: 0.5,
                }}
              >
                {list}
              </Box>

              <Box sx={{ position: "sticky", top: 24, height: "calc(100vh - 220px)", minHeight: 480 }}>
                {map}
              </Box>
            </Box>
          ) : (
            <>
              <Tabs
                value={mobileView}
                onChange={(_, value) => setMobileView(value)}
                variant="fullWidth"
                sx={{ mb: 2, borderBottom: "1px solid var(--oa-border-1)" }}
              >
                <Tab value="list" label={t("doctors.listTab")} sx={{ textTransform: "none", fontWeight: 700 }} />
                <Tab value="map" label={t("doctors.mapTab")} sx={{ textTransform: "none", fontWeight: 700 }} />
              </Tabs>

              {mobileView === "list" ? (
                list
              ) : (
                <Box sx={{ height: "65vh", minHeight: 360 }}>{map}</Box>
              )}
            </>
          )}

          <Typography
            variant="caption"
            sx={{ display: "block", mt: 3, color: "var(--oa-text-500)", lineHeight: 1.6 }}
          >
            {t("doctors.disclaimer")}
          </Typography>
        </Box>
      )}
    </PageShell>
  );
}

export default FindDoctorPage;
