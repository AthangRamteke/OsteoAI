"""LLM provider chain for the OsteoAI Agent: Gemini -> Grok -> local Qwen.

Each cloud provider is skipped when its API key is missing, and any failure
(expired/invalid key, quota exhausted, network error) falls through to the
next provider. Qwen runs locally through Ollama and is the final backup.

Configuration (environment variables or backend/.env):
    GEMINI_API_KEY, GEMINI_MODEL   (default: gemini-2.5-flash)
    GROK_API_KEY,   GROK_MODEL     (default: grok-3-mini)
    OLLAMA_URL,     QWEN_MODEL     (default: http://localhost:11434, qwen3.5:4b)
    LLM_TIMEOUT_SECONDS            (default: 60, cloud providers)
    QWEN_TIMEOUT_SECONDS           (default: 180, allows cold model load)
"""

from __future__ import annotations

import json
import logging
import os
from pathlib import Path
from typing import Any, Iterator
from urllib import error, request


logger = logging.getLogger(__name__)

Message = dict[str, str]  # {"role": "system" | "user" | "assistant", "content": ...}


class ProviderError(Exception):
    """Raised when a provider cannot produce a reply."""


def _load_dotenv() -> None:
    env_path = Path(__file__).resolve().parents[2] / ".env"
    if not env_path.is_file():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


_load_dotenv()


def _timeout() -> float:
    return float(os.getenv("LLM_TIMEOUT_SECONDS", "60"))


def _post_json(
    url: str,
    payload: dict[str, Any],
    headers: dict[str, str],
    timeout: float | None = None,
) -> dict[str, Any]:
    req = request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", **headers},
        method="POST",
    )
    try:
        with request.urlopen(req, timeout=timeout or _timeout()) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")[:300]
        raise ProviderError(f"HTTP {exc.code}: {body}") from exc
    except (error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise ProviderError(str(exc)) from exc


# ---------------------------------------------------------------------------
# Providers
# ---------------------------------------------------------------------------


def _gemini(messages: list[Message]) -> str:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ProviderError("GEMINI_API_KEY not set")
    model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

    system = "\n".join(m["content"] for m in messages if m["role"] == "system")
    contents = [
        {
            "role": "model" if m["role"] == "assistant" else "user",
            "parts": [{"text": m["content"]}],
        }
        for m in messages
        if m["role"] != "system"
    ]
    payload: dict[str, Any] = {"contents": contents}
    if system:
        payload["systemInstruction"] = {"parts": [{"text": system}]}

    data = _post_json(
        f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
        payload,
        {"x-goog-api-key": api_key},
    )
    try:
        return "".join(p.get("text", "") for p in data["candidates"][0]["content"]["parts"])
    except (KeyError, IndexError) as exc:
        raise ProviderError(f"Unexpected Gemini response: {data}") from exc


def _grok(messages: list[Message]) -> str:
    api_key = os.getenv("GROK_API_KEY")
    if not api_key:
        raise ProviderError("GROK_API_KEY not set")
    model = os.getenv("GROK_MODEL", "grok-3-mini")

    data = _post_json(
        "https://api.x.ai/v1/chat/completions",
        {"model": model, "messages": messages},
        {"Authorization": f"Bearer {api_key}"},
    )
    try:
        return data["choices"][0]["message"]["content"]
    except (KeyError, IndexError) as exc:
        raise ProviderError(f"Unexpected Grok response: {data}") from exc


def _qwen_payload(messages: list[Message]) -> dict[str, Any]:
    return {
        "model": os.getenv("QWEN_MODEL", "qwen3.5:4b"),
        "messages": messages,
        "stream": False,
        # think=False skips Qwen's hidden reasoning so replies come back faster.
        "think": False,
        # Lower temperature keeps health answers factual and consistent;
        # num_predict is a hard cap backing up the prompt's brevity rule.
        # num_gpu=999 asks Ollama to offload as many layers as VRAM allows,
        # instead of its conservative default CPU/GPU split.
        "options": {
            "temperature": 0.4,
            "num_ctx": 8192,
            "num_predict": 220,
            "num_gpu": 999,
        },
        "keep_alive": "30m",
    }


def _qwen(messages: list[Message]) -> str:
    base_url = os.getenv("OLLAMA_URL", "http://localhost:11434").rstrip("/")
    data = _post_json(
        f"{base_url}/api/chat",
        _qwen_payload(messages),
        {},
        # Local model may need to load into memory on first call.
        timeout=float(os.getenv("QWEN_TIMEOUT_SECONDS", "180")),
    )
    try:
        return data["message"]["content"]
    except KeyError as exc:
        raise ProviderError(f"Unexpected Ollama response: {data}") from exc


PROVIDERS = (
    ("gemini", _gemini),
    ("grok", _grok),
    ("qwen", _qwen),
)


def generate(messages: list[Message]) -> tuple[str, str]:
    """Return (reply, provider_name) from the first provider that succeeds."""
    failures = []
    for name, provider in PROVIDERS:
        try:
            reply = provider(messages).strip()
            if reply:
                return reply, name
            failures.append(f"{name}: empty reply")
        except ProviderError as exc:
            logger.warning("LLM provider %s failed, trying next: %s", name, exc)
            failures.append(f"{name}: {exc}")
    raise ProviderError("All LLM providers failed -> " + " | ".join(failures))


# ---------------------------------------------------------------------------
# Streaming
# ---------------------------------------------------------------------------


def _qwen_stream(messages: list[Message]) -> Iterator[str]:
    base_url = os.getenv("OLLAMA_URL", "http://localhost:11434").rstrip("/")
    payload = {
        **_qwen_payload(messages),
        "stream": True,
    }
    req = request.Request(
        f"{base_url}/api/chat",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        resp = request.urlopen(
            req, timeout=float(os.getenv("QWEN_TIMEOUT_SECONDS", "180"))
        )
    except (error.URLError, TimeoutError) as exc:
        raise ProviderError(str(exc)) from exc

    with resp:
        # Ollama streams one JSON object per line.
        for line in resp:
            if not line.strip():
                continue
            chunk = json.loads(line)
            if chunk.get("error"):
                raise ProviderError(chunk["error"])
            text = chunk.get("message", {}).get("content", "")
            if text:
                yield text
            if chunk.get("done"):
                break


def generate_stream(messages: list[Message]) -> Iterator[tuple[str, str]]:
    """Yield (text_chunk, provider_name) from the first provider that works.

    Cloud providers return their whole reply as one chunk; Qwen streams
    token by token. Fallback only happens before the first chunk is sent.
    """
    failures = []
    for name, provider in PROVIDERS:
        try:
            if name == "qwen":
                iterator = _qwen_stream(messages)
                first = next(iterator, "")
                if not first:
                    raise ProviderError("empty reply")
                yield first, name
                for text in iterator:
                    yield text, name
                return
            reply = provider(messages).strip()
            if reply:
                yield reply, name
                return
            failures.append(f"{name}: empty reply")
        except ProviderError as exc:
            logger.warning("LLM provider %s failed, trying next: %s", name, exc)
            failures.append(f"{name}: {exc}")
    raise ProviderError("All LLM providers failed -> " + " | ".join(failures))
