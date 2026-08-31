# BUILD SPEC — Hiver Omni Notifications Settings (revamp, no priority)

doc_type: build-ready spec for an AI coding agent (Claude Code)
audience: Claude Code / code-gen agent
status: ready to build; nothing built yet for THIS (no-priority) version
font: Hanken Grotesk
authoritative_source_note: if this conflicts with the Confluence PRD "Product Spec: Priority notifications", the human should reconcile. Priority is DROPPED (see §1).

---

## 1. WHAT TO BUILD (current, simplified goal)

Build a single full-screen **Notification Settings** page for Hiver Omni that:

- Lets a support agent turn notifications **on/off per activity, per channel**.
- Keeps **sound customization** (per-channel sound on/off + a tone from a fixed list + preview).
- **Has NO priority feature.** Do NOT add stars, "show first", priority columns, or any priority concept. Each notification has exactly ONE decision: on or off.
- Is designed to **scale as channels are added** (Email, Chat, Slack today; WhatsApp, Voice, SMS later).

Deliverable: build **TWO organizations of the same content**, switchable via a toggle/switcher at the top of the page, so the team can compare:
- **Option A — Channel-first (tabs).**
- **Option B — Activity-first (grid).**

Both use the SAME activity list, SAME channels, SAME sound section. Only the notifications layout differs.

Tech: single self-contained HTML file, vanilla JS, inline CSS. No build tools, no external JS libs. Load Hanken Grotesk from Google Fonts. No localStorage/sessionStorage. All state in JS memory.

---

## 2. DATA MODEL

### Channels (order matters)
```
email    · "Email"    · icon ✉
chat     · "Chat"     · icon 💬
slack    · "Slack"    · icon #
whatsapp · "WhatsApp" · icon ◐
voice    · "Voice"    · icon ☎
```

### Shared activities (12), grouped in 3 buckets
```
Bucket "Assigned to me":
  assigned    · "A conversation is assigned to me"
  reply_mine  · "A new reply on a conversation assigned to me"
  mention     · "Someone @mentions me in a note"
  reassigned  · "A conversation is reassigned away from me"

Bucket "New activity":
  new_convo   · "A new conversation comes in"
  reopened    · "A conversation is reopened"
  followed    · "A conversation I follow is updated"
  cust_reply  · "A customer replies"

Bucket "Deadlines & feedback":
  sla_first   · "First-response SLA is about to breach"
  sla_res     · "Resolution SLA is breached"
  csat        · "CSAT feedback is received"
  resolved    · "A conversation is marked resolved"
```

### Channel-specific activities (extra, only shown for that channel)
```
email:    bounce    · "An email bounces or fails to deliver"
chat:     queue     · "A visitor is waiting in the queue"
slack:    added     · "You’re added to a Slack channel"
whatsapp: window    · "The 24-hour reply window is about to close"
voice:    voicemail · "A voicemail is left"
voice:    missed    · "You missed a call"
```

### Sound state (per channel)
```
each channel: { soundOn: bool, tone: string }
tones (fixed list, no uploads): ["Chime","Ping","Knock","Pop","Ring","Soft"]
default tone per channel: email=Chime, chat=Ping, slack=Knock, whatsapp=Pop, voice=Ring
```

### Notification state
```
state[channelId][activityId] = boolean (enabled on/off)
```

### Defaults (so nothing starts empty)
```
enabled by default on every channel: assigned, mention, sla_first, sla_res
sound master: ON
per-channel soundOn: all ON except slack = OFF (just to show an off state)
```

---

## 3. PAGE STRUCTURE (shared across both options)

```
Notification settings                         (h1)
short intro line

[ Switcher: (•) By channel   ( ) By activity ]   ← chooses Option A vs B for the notifications area only

┌─ SOUND NOTIFICATIONS (always the same, both options) ─┐
│ 🔊 Sound notifications                    [master ON/OFF] │
│  (when ON, reveal per-channel rows:)                     │
│   ✉ Email     ▶ Chime   [on]                             │
│   💬 Chat      ▶ Ping    [on]                             │
│   # Slack     ▶ Knock   [off]                            │
│   ◐ WhatsApp  ▶ Pop     [on]                             │
│   ☎ Voice     ▶ Ring    [on]                             │
└──────────────────────────────────────────────────────────┘

┌─ NOTIFICATIONS (layout depends on switcher) ─┐
│  … Option A or Option B …                     │
└───────────────────────────────────────────────┘
```

### Sound section behaviour (identical in both options)
- Master switch. Default ON. When OFF → hide/collapse the per-channel rows entirely (no sound plays).
- Each channel row: name+icon, on/off switch, tone button (cycles the fixed tone list), preview ▶ button (brief visual "playing" pulse).
- When a channel's soundOn = OFF → dim/disable its tone picker.
- Sound is CHANNEL-LEVEL only. There is NO per-activity sound.

---

## 4. OPTION A — CHANNEL-FIRST (TABS)

- Row of tabs = channels (Email, Chat, Slack, WhatsApp, Voice), icon+name. Active tab highlighted (underline + accent color).
- Clicking a tab shows that channel's notifications table.
- Table columns:
  1. "Notification type"  (left, activity label)
  2. "Enable notification" (right, a toggle switch)
- Rows grouped by bucket; render a bucket subheader row before each bucket's items.
- After the 3 shared buckets, if the channel has channel-specific activities, render a bucket titled **"Only on <Channel>"** with those rows; tag each with a small "Only here" pill.
- Toggle = enable/disable that activity for that channel. Independent per channel.
- Switching tabs preserves each channel's state.

Flow: user configures one channel, switches tab, configures next.

---

## 5. OPTION B — ACTIVITY-FIRST (GRID)

- A table: rows = activities, columns = channels.
- Header row: first cell blank/"Notify me when…", then one column per channel (icon+name). Put each channel's small sound control in/near its column header OR keep sound only in the top Sound section (either is fine; simpler = keep sound only in the top section).
- Rows grouped by bucket (bucket subheader spanning full width before each group).
- Cell = a checkbox: ON = notify me for this activity on this channel.
- **Channel-specific activities:** an activity only applies to its own channel. In the grid, render the activity as a normal row but show a disabled "—" cell for the channels it does NOT apply to, with a tooltip "Not available for <Channel>". (These channel-specific rows can go in a trailing "Channel-specific" bucket, or inline in their bucket — trailing bucket is cleaner.)
- No priority. Just the checkbox per cell.

Note on N/A cells: the 12 shared activities apply to ALL channels (treat as available everywhere) UNLESS the team says otherwise. Only the channel-specific activities create N/A cells. `[assumption]` shared activities are available on all channels; flag for human confirmation.

---

## 6. INTERACTIONS / STATE RULES

- Toggling an activity on/off updates `state[channel][activity]`.
- Switcher (By channel / By activity) only changes the notifications layout; sound section and underlying state persist across the switch.
- Option A tab switching preserves state.
- No save button — instant apply (personal prefs, low stakes). `[confirm]` matches Omni's other settings; if backend needs batching, add a Save + dirty-state instead.
- No priority anywhere.

---

## 7. STYLING

- Font: Hanken Grotesk (Google Fonts).
- Light theme: white cards, subtle grey lines, page bg light grey (#eef1f5-ish).
- Accent for "on"/enabled: blue (#2f6fed).
- Sound accent: amber/orange ok (#f5a623) but NOT used for priority (priority removed).
- Rounded cards (~13–14px radius). Comfortable padding. Support-agent-friendly, uncluttered.
- Toggle switch component; checkbox component (for grid); tab component; info tooltips as needed.
- Respect `prefers-reduced-motion`.
- No emojis required except the simple channel glyphs (✉ 💬 # ◐ ☎) — replace with real icons if an icon set is available.

---

## 8. OPEN QUESTIONS (leave TODO comments in code)

- Q1: Are all 12 shared activities valid on ALL channels? (e.g., does Voice have "@mention in a note"? does Slack have "CSAT"?) If some are N/A, grey them out in Option B and omit them in Option A for that channel.
- Q2: Confirm channel-specific activities are real Hiver events.
- Q3: Instant-apply vs Save button (see §6).
- Q4: In Option B, should per-channel sound controls sit in the column headers, or only in the top Sound section? (Default: top section only.)
- Q5: Default channel order and which channels are live now vs "coming soon".

---

## 9. WHAT WE ALREADY BUILT (reference prototypes)

These were built earlier in the design process. They still contain useful patterns, BUT several include a PRIORITY feature that is now DROPPED. Use them for visual/interaction reference only; strip priority.

| file | what it is | reuse? | priority inside? |
|---|---|---|---|
| omni-notifications-approach-1.html | Global sound switch + channel-first TABS + table (Enable + priority star) + channel-specific "Only here" activities | **BEST STARTING POINT for Option A** — copy it, then REMOVE the priority star column + info tooltip | YES → remove |
| omni-settings-layouts-with-mode.html | 4 layouts (table/cards/list/stepper) + "same for all vs per channel" mode toggle | reference for Option B grid + the mode toggle idea | had priority → ignore priority parts |
| omni-notification-settings-3properties.html | notify + "show first" + per-alert sound, 3 parallel sections | reference for the sound section styling only | YES (priority + per-alert sound) → ignore |
| omni-notification-settings-simple.html | simple single event-first screen | reference for plain agent-friendly language | YES → ignore |
| omni-settings-layout-options-simple.html | 4 plain-language layouts | reference for Option B look | YES → ignore |
| event-first-sound-priority-options.html | 5 ways to place sound+priority in a grid | reference only | YES → ignore |

RECOMMENDATION for Claude Code:
- Start from `omni-notifications-approach-1.html` for **Option A** (it already has: sound master + per-channel sound rows + tone + preview, channel tabs, bucketed table, channel-specific "Only here" activities). Then DELETE the "Set as priority" column, its header, its info tooltip, and all star logic.
- Build **Option B** fresh as an activity×channel checkbox grid using the same data model.
- Add a top-level switcher to flip between Option A and Option B.

FILES TO SHARE WITH CLAUDE CODE:
1. THIS spec file (primary).
2. `omni-notifications-approach-1.html` (as the Option-A starting point / visual reference).
3. (optional) `omni-settings-layouts-with-mode.html` for the Option-B grid + mode-toggle reference.
You do NOT need to share the other HTML files unless you want more visual references; they all contain the now-removed priority concept.

---

## 10. ACCEPTANCE CHECKLIST

- [ ] Single self-contained HTML, Hanken Grotesk, no external libs, no localStorage.
- [ ] Sound section: master switch collapses per-channel rows; per-channel on/off + tone cycle + preview; tone disabled when channel sound off.
- [ ] Switcher toggles between Option A (channel tabs) and Option B (activity grid); sound + state persist.
- [ ] Option A: channel tabs, bucketed table, single Enable toggle per row, "Only on <Channel>" bucket with channel-specific activities.
- [ ] Option B: activity rows × channel columns, checkbox per cell, bucket subheaders, channel-specific activities with disabled "—" + tooltip on non-applicable channels.
- [ ] NO priority anywhere (no stars, no "show first", no priority column/tooltip).
- [ ] 12 shared activities in 3 buckets + channel-specific activities exactly as listed in §2.
- [ ] Sensible defaults applied (§2).
- [ ] TODO comments for the open questions in §8.
