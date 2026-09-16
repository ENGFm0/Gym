# FitCore API

ASP.NET Core 8 API behind the FitCore app. React talks only to this; Firestore is reached
through the Admin SDK on the server, never from the browser.

```
src/
  FitCore.Domain          entities and value objects, no dependencies
  FitCore.Application     the maths and the use cases (this is where the prototype's logic lives)
  FitCore.Infrastructure  Firestore repositories, Cloud Storage, Firebase custom claims
  FitCore.Api             controllers, auth, Swagger
```

## Why the layers are split this way

Every number the app shows — calories, macros, MET burn, weekly adherence, the split assigned
to each training day — is computed in `FitCore.Application` and returned ready to render. The
client never recomputes them, so the phone, the web app and the coach's dashboard can never
disagree about what a member's week looked like.

## Auth

Firebase Auth issues the identity; the API validates the ID token as an ordinary JWT
(`issuer = https://securetoken.google.com/<projectId>`, `audience = <projectId>`), so no extra
round trip is needed per request. A coach account carries the custom claim `coach: true`, set
through `POST /api/me/become-coach`; the client must refresh its ID token once afterwards.

## Configuration

`appsettings.json`, or environment variables / user secrets in development:

| Key | Meaning |
|---|---|
| `Firebase:ProjectId` | the Firebase project — also the token audience |
| `Firebase:CredentialsJson` | inline service account JSON; leave empty to use `GOOGLE_APPLICATION_CREDENTIALS` |
| `Firebase:StorageBucket` | bucket for progress photos, e.g. `fitcore.appspot.com` |
| `Firebase:SignedUrlMinutes` | how long an upload or read link lives (default 15) |
| `Cors:Origins` | the origins the React app is served from |
| `Anthropic:ApiKey` | key for reading InBody reports; empty falls back to `ANTHROPIC_API_KEY` |
| `Anthropic:Model` | defaults to `claude-opus-5` |
| `Foods:ExternalLookup` | off by default; on, an unknown barcode is looked up in Open Food Facts |
| `Foods:UserAgent` | Open Food Facts throttles anonymous traffic — identify the app |

```bash
dotnet user-secrets --project src/FitCore.Api set "Firebase:ProjectId" "your-project"
dotnet user-secrets --project src/FitCore.Api set "Firebase:StorageBucket" "your-project.appspot.com"
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
dotnet run --project src/FitCore.Api      # http://localhost:5126, Swagger at /swagger
```

The shipped food catalog (35 Saudi staples with per-unit nutrition) is written to `foods/` on
first start if that collection is empty.

## Firestore layout

```
users/{uid}                     profile, units, rest length
users/{uid}/days/{yyyy-MM-dd}    meals{}, steps, water
users/{uid}/weights/{id}         one document per reading — never overwritten
users/{uid}/measures/{id}        same rule for body measurements
users/{uid}/photos/{id}          storage path only; the image lives in Cloud Storage
users/{uid}/activities/{id}      what the member trains, and how many times a week
users/{uid}/sessions/{id}        finished sessions, with server-computed calories
users/{uid}/program/current      training days (Saturday = 0) and the split on each
users/{uid}/exLast/{exercise}    last working set, shown while logging the next one
foods/{id}                       shared catalog plus members' own items
coachLinks/{coach}__{trainee}    a coach may only read through one of these
```

Firestore cannot `SUM` or `GROUP BY`, so weekly figures are computed from a bounded read
(`at >= startOfWeek`). If the user base grows, move these to counters updated on write.

## Endpoints

| Method | Route | |
|---|---|---|
| GET/PUT | `/api/me/profile` | the member's own data |
| GET | `/api/me/plan` | BMR, TDEE, calories, macros, BMI |
| GET | `/api/me/diets` | the diet library with eat / avoid lists |
| POST | `/api/me/become-coach` | sets the coach claim |
| GET | `/api/diary/{date}` | meals, totals, targets, steps, water, burn, left |
| POST/DELETE | `/api/diary/{date}/entries[/{id}]` | log or remove an item |
| PATCH | `/api/diary/{date}` | steps (from the phone) and water |
| GET | `/api/foods?q=` · `/api/foods/barcode/{code}` | search and barcode |
| POST | `/api/foods/custom` | a member's own item |
| GET/POST/DELETE | `/api/progress/weights` | append-only weigh-ins with the delta |
| GET/POST/DELETE | `/api/progress/measurements` | append-only body measurements |
| POST | `/api/progress/photos/ticket` | signed upload URL |
| GET/POST/DELETE | `/api/progress/photos` | progress photos |
| GET | `/api/training/week` | the dashboard |
| GET/PUT | `/api/training/program`, `/program/days` | 1 to 7 days, which weekdays, which split |
| PUT | `/api/training/program/days/{slot}/exercises` | a day's exercises |
| GET/POST/PATCH/DELETE | `/api/training/activities` | activities and weekly targets |
| GET | `/api/training/activities/catalog` | swimming, running, padel, … |
| GET/POST/DELETE | `/api/training/sessions` | log a session, read the history |
| GET | `/api/training/exercises/{name}/last` | last working set |
| GET/POST/DELETE | `/api/coach/trainees…` | coach dashboard, plan against actual |
| POST/DELETE | `/api/coach/trainees`, `/api/coach/invites/{id}` | invite by email, revoke |
| PUT | `/api/coach/trainees/{uid}/plan` | assign a diet, calories and a note |
| GET | `/api/me/invites` | invites waiting for this member |
| POST | `/api/me/invites/{id}/accept` · `/decline` | accepting is what creates the link |
| POST | `/api/me/leave-coach` | the member walks away whenever they like |
| POST | `/api/scan/inbody` | reads a body-composition photo into typed numbers |
| POST | `/api/scan/inbody/save` | keeps the numbers the member confirmed |
| POST/DELETE | `/api/me/devices` | register or forget a device for push |
| GET/PUT | `/api/me/reminders` | when to be nudged, in the member's own local time |
| GET | `/api/me/export` | everything we hold, as one JSON file |
| DELETE | `/api/me?confirm=delete` | the account and the sign-in, gone |
| GET/PUT | `/api/coach/trainees/{uid}/program` | the coach sets their training week |
| POST | `/api/jobs/reminders` | the scheduler's entry point, behind a shared secret |
| POST | `/api/diagnostics/client-error` | where the app reports a crash it survived |

## Firestore security rules

The API holds admin credentials, so the client needs no direct access. Keep the rules closed:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} { allow read, write: if false; }
  }
}
```

## Coaching

A coach invites by email, because they do not know the member's uid. The invite sits in
`coachInvites` as pending and **nothing about the member is readable until they accept it** —
accepting is the only thing that writes a `coachLinks` document, and every coach route calls
`RequireLinkAsync` before it reads anything.

What a coach sets lands on the member's own profile as an `assignment` (diet, optional
calorie override, a note). The plan calculator reads it ahead of the member's own choice, so
one number reaches every screen; the member can drop it at any time, and picking a diet by
hand drops it automatically. That keeps the member's account theirs while the coach's plan
still actually applies.

## Reading InBody reports

`POST /api/scan/inbody` takes the photo as multipart and sends it to Claude with a JSON
schema, so the response always has the same shape and never needs parsing out of prose.
The numbers come back with a `confidence` and go to the member to confirm — nothing is
written until they accept, and what they keep is stored as an ordinary weigh-in so the
history stays one list.

The model is `claude-opus-5` (`Anthropic:Model`). A refusal arrives as a normal 200 with
stop details rather than an exception, and is handled as an unreadable sheet. If you want
the server-side fallback behaviour on refusals, move the call to `client.Beta.Messages`
with the `server-side-fallback-2026-07-01` beta and `fallbacks: "default"`.

Images are capped at 8 MB and limited to JPEG, PNG and WebP.

## Tests

```bash
dotnet test
```

`tests/FitCore.Application.Tests` covers the maths that everything else reads: Mifflin-St
Jeor against a hand-computed BMR, age derived from the birth date, the activity factors,
the goal deltas and the 1200 kcal floor, the macro split per diet, the 1-to-7-day week
planner (including that flipping days keeps the exercises already entered and that the last
training day cannot be removed), and MET burn.

## Barcodes

`GET /api/foods/barcode/{code}` checks our own catalog first, then — when
`Foods:ExternalLookup` is on — Open Food Facts, the open product database. A hit is written
into `foods` with its barcode, so the second person to scan that packet gets it instantly and
offline. Entries with no energy value are ignored rather than logged as zero-calorie food.

The lookup is off by default because turning it on sends scanned barcodes to a third party;
that is the member's data leaving, so it is a decision, not a default.

## Notifications

Device tokens live under `users/{uid}/devices`; a token FCM reports as unregistered is deleted
rather than retried, which is the common case after an app is removed. Three things are worth
a push and nothing else is: a coach assigning a plan, a member accepting an invite, and a
member logging a session while they have a coach. Text is sent in the member's own language.

## Limits

Two layers, both keyed on the member rather than the IP — a gym's wifi is one address for
everyone in it:

- The whole API: 300 requests a minute.
- `POST /api/scan/inbody`: 5 in five minutes, and **10 a day** enforced in Firestore with a
  transaction, because that endpoint calls a model and costs real money per call.

## Reminders

Three nudges, and each one checks before it fires: a meal time where nothing is logged, a
training day with no session yet, the weekly weigh-in when the last one is five days old.
Nobody is told to do what they already did.

Times are the member's own, so the offset travels with the settings — the server is UTC and
has no other way to know it is 8pm in Riyadh. The day each reminder last fired is written
down, so a re-run or a restart cannot send it twice.

Cloud Scheduler drives it:

```bash
gcloud scheduler jobs create http fitcore-reminders \
  --schedule "*/15 * * * *" --time-zone UTC \
  --uri "https://<api-host>/api/jobs/reminders" --http-method POST \
  --headers "X-Job-Secret=$JOBS_SECRET"
```

`Jobs:Secret` must be set, or the route answers 404 — an unset secret closes it rather than
opening it.

## Logs

Logs go to stdout as JSON, which is what Cloud Run collects and indexes. Every request carries
an `X-Request-Id` (echoed back, so a member can quote it) and a scope with that id and the uid;
only failures and anything over a second are written, so the log stays readable. Front-end
crashes arrive at `/api/diagnostics/client-error` and land in the same stream.

## Tests

```bash
dotnet test           # both projects
```

- `FitCore.Application.Tests` — the maths: Mifflin-St Jeor against a hand-computed BMR, the
  activity factors, goal deltas and the 1200 kcal floor, macro splits, the 1-to-7-day week
  planner, MET burn, and what a coach's assignment overrides.
- `FitCore.Api.Tests` — the real pipeline over in-memory stores: the plan end to end, logging
  and removing food, steps feeding the burn, two weigh-ins that both survive, the training week
  keeping its exercises through a change, MET burn on a logged session, the scan allowance, and
  export and delete. The coaching rules get their own file, because they are the ones with
  teeth: an invite reveals nothing until it is accepted, an invite addressed to someone else
  cannot be accepted, a coach cannot read a member who is not theirs, an assignment changes the
  member's plan and the member can drop it, and the job route needs its secret.
