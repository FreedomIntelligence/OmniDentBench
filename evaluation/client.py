"""Minimal client for OpenAI-compatible chat completions."""

import json
import os
import re
import time
from http.client import HTTPException
from urllib import error, parse, request

from json_repair import repair_json


CONTENT_BLOCK_CODES = {
    "content_filter", "content_policy_violation", "image_content_blocked",
    "data_inspection_failed", "datainspectionfailed", "inappropriate_content", "safety_block",
}


class EndpointError(RuntimeError):
    """Endpoint or authentication failure that invalidates the run."""


class RequestFailure(RuntimeError):
    """Provider could not complete a request for this item."""


class InvalidResponse(ValueError):
    """The provider did not return a gradable response."""


def endpoint(role):
    prefix = f"ODB_{role.upper()}"
    base = os.environ.get(f"{prefix}_BASE_URL", "").rstrip("/")
    key = os.environ.get(f"{prefix}_API_KEY", "")
    parts = parse.urlsplit(base)
    local = parts.hostname in {"localhost", "127.0.0.1", "::1"}
    if (not parts.hostname or parts.username or parts.password or parts.query or parts.fragment
            or not (parts.scheme == "https" or (local and parts.scheme == "http"))):
        raise EndpointError(f"Set {prefix}_BASE_URL to an HTTPS API base (HTTP allowed on localhost).")
    if not key.strip():
        raise EndpointError(f"Set {prefix}_API_KEY.")
    return base + "/chat/completions", key


class _NoRedirect(request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def _content_block_code(body):
    try:
        payload = json.loads(body)
    except ValueError:
        return None
    details = payload.get("error") if isinstance(payload, dict) else None
    if not isinstance(details, dict):
        return None

    codes = {str(details.get(key, "")).lower() for key in ("code", "type")}
    matches = codes & CONTENT_BLOCK_CODES
    if matches:
        return min(matches)
    if not codes & {"bad_response_status_code", "upstream_error"}:
        return None

    # Some proxies embed a JSON error object in the upstream error message.
    message = details.get("message")
    if not isinstance(message, str) or "{" not in message:
        return None
    try:
        upstream, _ = json.JSONDecoder().raw_decode(message[message.index("{"):])
    except ValueError:
        return None
    details = upstream.get("error") if isinstance(upstream, dict) else None
    if isinstance(details, dict):
        for key in ("code", "type"):
            code = str(details.get(key, "")).lower()
            if code in CONTENT_BLOCK_CODES:
                return code
    return None


def post_json(url, payload, key):
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = request.Request(url, data=body, headers={
        "Content-Type": "application/json", "Authorization": "Bearer " + key,
    })
    opener = request.build_opener(_NoRedirect())
    for attempt in range(3):
        try:
            with opener.open(req, timeout=1200) as response:
                return json.load(response)
        except error.HTTPError as exc:
            with exc:
                body = exc.read(16384)
            if exc.code in (400, 403, 422):
                code = _content_block_code(body)
                if code:
                    raise RequestFailure(f"Provider declined item ({code}).") from None
            transient = exc.code in (408, 429) or 500 <= exc.code < 600
            if not transient or attempt == 2:
                raise EndpointError(f"Check API configuration and availability (HTTP {exc.code}).") from None
        except (OSError, HTTPException) as exc:
            if attempt == 2:
                raise EndpointError(f"Cannot reach API after three attempts ({type(exc).__name__}).") from None
        except ValueError:
            raise EndpointError("Provider returned an invalid HTTP response body.") from None
        time.sleep(2 ** attempt)


def parse_completion(raw):
    for marker in ("<｜end▁of▁thinking｜>", "</think>"):
        raw = raw.rsplit(marker, 1)[-1]
    text = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw.strip(), flags=re.MULTILINE)
    try:
        value = json.loads(text)
    except ValueError:
        value = repair_json(text, return_objects=True)
        if isinstance(value, list) and len(value) == 1:
            value = value[0]
    if not isinstance(value, dict):
        raise InvalidResponse("Expected one JSON object.")
    return value


def completion(connection, model, system, prompt, images, options, validate):
    """Request JSON and retry item blocks or invalid completions up to twice."""
    retry_note = ""
    for attempt in range(3):
        text = prompt + retry_note
        content = [{"type": "text", "text": text}, *images] if images else text
        payload = {
            "model": model,
            "messages": [{"role": "system", "content": system}, {"role": "user", "content": content}],
            "response_format": {"type": "json_object"},
            **options,
        }
        try:
            reply = post_json(connection[0], payload, connection[1])
            try:
                choice = reply["choices"][0]
                if choice.get("finish_reason") == "content_filter":
                    raise RequestFailure("Provider declined item (content_filter).")
                if choice.get("finish_reason") in ("length", "max_tokens"):
                    raise InvalidResponse("Output limit reached. Return a shorter, complete response.")
                raw = choice["message"]["content"]
            except (IndexError, KeyError, TypeError, AttributeError):
                raise EndpointError("Endpoint did not return a chat-completions response.") from None
            if not isinstance(raw, str) or not raw.strip():
                raise InvalidResponse("Empty completion.")
            parsed = parse_completion(raw)
            return raw, validate(parsed)
        except RequestFailure:
            if attempt == 2:
                raise
        except (KeyError, IndexError, ValueError, TypeError) as exc:
            retry_note = ("\n\nIMPORTANT: Your previous response did not match the required format. "
                          "Return ONLY valid JSON. Do not include planning text or markdown fences.")
            reason = str(exc) if isinstance(exc, InvalidResponse) else "Malformed completion."
            retry_note += " " + reason
    raise InvalidResponse(reason)
