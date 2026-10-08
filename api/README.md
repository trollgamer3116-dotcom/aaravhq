# HQ AI connection

The liquid-glass AI section lives at `#ai`. Live replies require this small Node backend; GitHub Pages only hosts static files and does not run it.

## Activate

1. Deploy the repository's `api` directory to a Node-compatible HTTPS host. Use Node 22 or newer, no dependencies, and start command `npm start`. The host supplies `PORT`. Do not expose the Node port directly without HTTPS.
2. In the host's **private environment settings**, set:
   - `OPENAI_API_KEY`: your OpenAI project API key.
   - `OPENAI_MODEL`: a text model your API project can use (see official [model documentation](https://developers.openai.com/api/docs/models)). There is no client-side model override.
   - `HQ_ACCESS_CODE`: a long random private access code (at least 16 characters). Generate one locally with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
   - `HQ_ORIGIN`: `https://trollgamer3116-dotcom.github.io` (an origin, without a path or trailing slash).
3. Open HQ → AI → **Connection needed**. Enter the HTTPS backend URL, without `/chat` or `/health`, and the HQ access code. HQ verifies the authenticated health endpoint before enabling Send.

Never put the API key in GitHub, website code, chat messages, or HQ's access-code field. Keep `.env` files untracked. This server reads host environment variables; it does not load `.env.example` automatically.

## What is connected

- Replies stream through the OpenAI Responses API into HQ. Stop aborts the request. Session expiry, offline drafts, interrupted streams, and rate limits have visible states.
- The API key stays server-side. The private HQ access code is a single-person credential kept in the browser's **sessionStorage**, not in exported HQ backups.
- Conversations and drafts stay in separate local browser storage, capped at 20 threads / 40 messages per thread. These conversations are not currently included in the regular HQ backup export. The backend keeps no conversation database and requests `store:false`; this does not mean OpenAI processes no request data.
- Only messages in the current thread and explicitly attached note/story excerpts are sent. The assistant has no browsing, live search, calendar edits, or other tools. Attached URLs are reference text, not fetched pages.
- This is an API-powered assistant inside HQ, separate from your existing ChatGPT chat history. Configure API usage and budget alerts in your OpenAI project before activating it.
- One private owner per server: 2 concurrent replies, 10 requests/minute, 60/hour per running process, 48k characters of input, and 2,400 maximum output tokens. Multiple server instances require a shared rate-limit store; this backend is intended for your personal HQ.

## Tests

`npm test` checks origin restrictions, authentication, validation, split UTF-8 streaming, safe error handling, and rate limiting with a mock upstream. It does not spend API credits or prove a real model connection.
