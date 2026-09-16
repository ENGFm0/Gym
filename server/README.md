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
