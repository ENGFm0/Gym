# Privacy

_Last updated: 2026-09-16_

## The short version

FitCore tracks your food and your training. It is operated by [اسم الجهة المشغّلة].

Your data is yours: it is not sold and not used for advertising, and nobody else sees it except a coach whose invite you accepted.

You can download everything you logged, and you can delete your whole account from inside the app.

## What we hold

Your account: your email and name, and your phone if you enter one.

Your body data: date of birth, sex, height, weight and target, activity level and goal, measurements, and progress photos if you add them.

Your diary: the items you logged and their amounts, water, and steps.

Your training: your program, your activities and their weekly targets, and your sessions with their loads and durations.

Your settings: language, units, reminder times, and a device token for notifications.

Operational logs: a request id and your account id when something fails or is slow, and the error message if a screen crashes.

## Why

To compute your calories and macros and show your progress — that is the app itself; without this data there is nothing to show.

Steps, weight and sessions feed the numbers you see each day, and are not used for anything else.

Operational logs exist to find and fix failures, and age out over time.

## Who else sees it

A coach: sees nothing before you accept their invite. Once you do, they see your weight, measurements, progress photos, sessions and the food you logged, and can set your diet and program. You can unlink at any moment from the diet screen, and their access stops immediately.

Google / Firebase: hosts your account, your data and your photos (Firebase Auth, Firestore, Cloud Storage) and delivers notifications, as a processor acting for us.

Anthropic: if you photograph an InBody report, the image is sent to be read and the numbers come back to you; we do not keep the image. Nothing but that photo is sent.

Open Food Facts: if the operator enables it, only the barcode number — nothing about you — is sent when you scan a product we do not have.

There are no advertisers, no data brokers and no marketing trackers.

## Photos, steps and Bluetooth

Progress photos upload straight from your device with a short-lived link, and are shown to you with one too — they are never on a public URL.

Steps come from the browser's motion sensor, or from your phone's health app if you grant the mobile app access. The reading stays in your account.

The scale is read over Bluetooth by your own device — the number reaches us, the connection to the scale does not pass through us.

## Your rights

Download: Profile → Download my data gives you a file with everything you logged.

Correction: every field is editable inside the app.

Deletion: Profile → Delete my account removes your data and your sign-in for good. There is no undo.

Objection and withdrawal: you can turn notifications off, unlink your coach, and revoke health, camera and Bluetooth access in your device settings.

For anything else: [البريد للتواصل].

## How long

Your data stays while your account does, because it is your history — a weight curve means nothing without its earlier readings.

If you delete your account, your data and your sign-in go with it. Operational logs age out on their own shortly after.

## Where it lives

On Google Cloud, in the region the operator chose at setup.

Reading an InBody report is processed by Anthropic outside that region, and only for that moment: the photo goes, it is read, the result comes back.

## Children

The app is not meant for anyone under 16, and we do not knowingly collect their data.

## Changes

This notice was last updated on 2026-09-16.

Any material change is shown to you inside the app before it takes effect.
