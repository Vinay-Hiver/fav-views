import React, { useState, useRef, useEffect } from 'react';
import { Mail, MessageSquare, Hash, MessageCircle, Phone, Volume2, Info, CheckCheck, Check, ChevronDown } from 'lucide-react';
import { PlayCircle } from '@untitledui/icons';
import './NotificationSettings.css';

import barkTone from '../tones/bark.mp3';
import blingTone from '../tones/bling.mp3';
import chimeTone from '../tones/chime.mp3';
import dropletTone from '../tones/droplet.mp3';
import hornTone from '../tones/horn.mp3';
import meowTone from '../tones/meow.mp3';
import notificationTone from '../tones/notification.mp3';
import ringTone from '../tones/ring.mp3';
import twinkleTone from '../tones/twinkle.mp3';

// Channels — order matters
const CHANNELS = [
  { id: 'email', name: 'Email', Icon: Mail },
  { id: 'chat', name: 'Chat', Icon: MessageSquare },
  { id: 'slack', name: 'Slack', Icon: Hash },
  { id: 'whatsapp', name: 'WhatsApp', Icon: MessageCircle },
  { id: 'voice', name: 'Voice', Icon: Phone },
];

// 12 shared activities in 3 buckets — apply to every channel [assumption, see spec §5]
const BUCKETS = [
  {
    name: 'Assigned to me',
    items: [
      { id: 'assigned', label: 'A conversation is assigned to me' },
      { id: 'reply_mine', label: 'A new reply on a conversation assigned to me' },
      { id: 'mention', label: 'Someone @mentions me in a note' },
      { id: 'reassigned', label: 'A conversation is reassigned away from me' },
    ],
  },
  {
    name: 'New activity',
    items: [
      { id: 'new_convo', label: 'A new conversation comes in' },
      { id: 'reopened', label: 'A conversation is reopened' },
      { id: 'followed', label: 'A conversation I follow is updated' },
      { id: 'cust_reply', label: 'A customer replies' },
    ],
  },
  {
    name: 'Deadlines & feedback',
    items: [
      { id: 'sla_first', label: 'First-response SLA is about to breach' },
      { id: 'sla_res', label: 'Resolution SLA is breached' },
      { id: 'csat', label: 'CSAT feedback is received' },
      { id: 'resolved', label: 'A conversation is marked resolved' },
    ],
  },
];

// Channel-specific extra activities
const SPECIFIC = {
  email: [{ id: 'bounce', label: 'An email bounces or fails to deliver' }],
  chat: [{ id: 'queue', label: 'A visitor is waiting in the queue' }],
  slack: [{ id: 'added', label: "You're added to a Slack channel" }],
  whatsapp: [{ id: 'window', label: 'The 24-hour reply window is about to close' }],
  voice: [
    { id: 'voicemail', label: 'A voicemail is left' },
    { id: 'missed', label: 'You missed a call' },
  ],
};

const TONES = [
  { id: 'chime', name: 'Chime', file: chimeTone },
  { id: 'bling', name: 'Bling', file: blingTone },
  { id: 'ring', name: 'Ring', file: ringTone },
  { id: 'notification', name: 'Notification', file: notificationTone },
  { id: 'droplet', name: 'Droplet', file: dropletTone },
  { id: 'twinkle', name: 'Twinkle', file: twinkleTone },
  { id: 'horn', name: 'Horn', file: hornTone },
  { id: 'bark', name: 'Bark', file: barkTone },
  { id: 'meow', name: 'Meow', file: meowTone },
];
const TONE_MAP = Object.fromEntries(TONES.map((t) => [t.id, t]));
const DEFAULT_TONE = { email: 'chime', chat: 'notification', slack: 'bling', whatsapp: 'droplet', voice: 'ring' };
const DEFAULT_ON_ACTIVITIES = ['assigned', 'mention', 'sla_first', 'sla_res'];

function buildInitialState() {
  const state = {};
  CHANNELS.forEach((c) => {
    state[c.id] = {};
    const all = [...BUCKETS.flatMap((b) => b.items), ...(SPECIFIC[c.id] || [])];
    all.forEach((item) => {
      state[c.id][item.id] = DEFAULT_ON_ACTIVITIES.includes(item.id);
    });
  });
  return state;
}

function buildInitialSound() {
  const sound = {};
  CHANNELS.forEach((c) => {
    sound[c.id] = { on: c.id !== 'slack', tone: DEFAULT_TONE[c.id] };
  });
  return sound;
}

const NotificationSettings = ({ layout, setLayout }) => {
  const [soundMaster, setSoundMaster] = useState(true);
  const [sound, setSound] = useState(buildInitialSound);
  const [bulkTone, setBulkTone] = useState(DEFAULT_TONE.email);
  const [state, setState] = useState(buildInitialState);
  const [activeTab, setActiveTab] = useState('email');
  const [playingToneId, setPlayingToneId] = useState(null);
  const audioRef = useRef(null);

  const toggleChannelSound = (channelId) => {
    setSound((prev) => ({ ...prev, [channelId]: { ...prev[channelId], on: !prev[channelId].on } }));
  };

  const setChannelTone = (channelId, toneId) => {
    setSound((prev) => ({ ...prev, [channelId]: { ...prev[channelId], tone: toneId } }));
  };

  const applyBulkTone = (toneId) => {
    setBulkTone(toneId);
    setSound((prev) => {
      const updated = {};
      CHANNELS.forEach((c) => {
        updated[c.id] = { ...prev[c.id], tone: toneId };
      });
      return updated;
    });
  };

  const previewTone = (toneId) => {
    const tone = TONE_MAP[toneId];
    if (!tone) return;
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(tone.file);
    audioRef.current = audio;
    setPlayingToneId(toneId);
    audio.addEventListener('ended', () => setPlayingToneId((cur) => (cur === toneId ? null : cur)));
    audio.play().catch(() => setPlayingToneId((cur) => (cur === toneId ? null : cur)));
  };

  const setActivityForAllChannels = (activityId, value) => {
    setState((prev) => {
      const updated = {};
      CHANNELS.forEach((c) => {
        updated[c.id] = { ...prev[c.id], [activityId]: value };
      });
      return updated;
    });
  };

  const toggleActivity = (channelId, activityId) => {
    setState((prev) => ({
      ...prev,
      [channelId]: { ...prev[channelId], [activityId]: !prev[channelId][activityId] },
    }));
  };

  const activeChannel = CHANNELS.find((c) => c.id === activeTab);

  return (
    <div className="notif-settings">
      <header className="notif-header">
        <h1>Notification settings</h1>
        <p>Set up sounds once, then choose what notifies you on each channel.</p>
      </header>

      {/* SOUND SECTION */}
      <div className="notif-card">
        <div className="sound-head">
          <span className="sound-ic"><Volume2 size={18} /></span>
          <div className="sound-head-txt">
            <h2>Sound notifications</h2>
            <p>Play a sound when notifications arrive. Turn on to choose sounds per channel.</p>
          </div>
          <button
            className={`hs-switch ${soundMaster ? 'on' : ''}`}
            role="switch"
            aria-checked={soundMaster}
            onClick={() => setSoundMaster((v) => !v)}
          >
            <span className="hs-switch-handle" />
          </button>
        </div>

        {soundMaster && (
          <div className="sound-body">
            <div className="sound-sub">Pick which channels play a sound and choose a tone for each.</div>
            <div className="sound-bulk-row">
              <span className="sound-bulk-label">Use one tone everywhere</span>
              <ToneDropdown
                value={bulkTone}
                onChange={applyBulkTone}
                playingToneId={playingToneId}
                onPreview={previewTone}
              />
            </div>
            {CHANNELS.map((c) => {
              const s = sound[c.id];
              return (
                <div className="sound-row" key={c.id}>
                  <span className="sound-row-channel">
                    <span className="chip-ico"><c.Icon size={14} /></span>
                    {c.name}
                  </span>
                  <span className={`tone-controls ${s.on ? '' : 'disabled'}`}>
                    <ToneDropdown
                      value={s.tone}
                      onChange={(toneId) => setChannelTone(c.id, toneId)}
                      disabled={!s.on}
                      playingToneId={playingToneId}
                      onPreview={previewTone}
                    />
                  </span>
                  <button
                    className={`hs-switch ${s.on ? 'on' : ''}`}
                    role="switch"
                    aria-checked={s.on}
                    onClick={() => toggleChannelSound(c.id)}
                  >
                    <span className="hs-switch-handle" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* NOTIFICATIONS SECTION */}
      <div className="notif-card">
        <div className="notif-card-top">
          <div>
            <h2>Notifications</h2>
            <p>Choose what notifies you, per activity and per channel.</p>
          </div>
        </div>

        {layout === 'channel' ? (
          <ChannelFirst
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            activeChannel={activeChannel}
            state={state}
            toggleActivity={toggleActivity}
          />
        ) : (
          <ActivityFirst
            state={state}
            toggleActivity={toggleActivity}
            setActivityForAllChannels={setActivityForAllChannels}
          />
        )}
      </div>
    </div>
  );
};

function ToneDropdown({ value, onChange, disabled, playingToneId, onPreview }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const selected = TONE_MAP[value];

  useEffect(() => {
    if (!open) return undefined;
    const handleOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  return (
    <div className="tone-dropdown" ref={rootRef}>
      <button
        type="button"
        className="tone-dropdown-trigger"
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selected ? selected.name : 'Select tone'}
        <ChevronDown size={13} />
      </button>

      {open && (
        <div className="tone-dropdown-menu" role="listbox">
          {TONES.map((tone) => (
            <div
              className={`tone-option ${value === tone.id ? 'selected' : ''}`}
              role="option"
              aria-selected={value === tone.id}
              key={tone.id}
            >
              <button
                type="button"
                className={`tone-option-play ${playingToneId === tone.id ? 'playing' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview(tone.id);
                }}
                aria-label={`Preview ${tone.name}`}
              >
                <PlayCircle width={18} height={18} />
              </button>
              <button
                type="button"
                className="tone-option-label"
                onClick={() => {
                  onChange(tone.id);
                  setOpen(false);
                }}
              >
                {tone.name}
              </button>
              {value === tone.id && <Check size={14} className="tone-option-check" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ChannelFirst({ activeTab, setActiveTab, activeChannel, state, toggleActivity }) {
  const specificItems = SPECIFIC[activeTab] || [];
  return (
    <>
      <div className="tabs" role="tablist">
        {CHANNELS.map((c) => (
          <button
            key={c.id}
            className={`tab ${c.id === activeTab ? 'active' : ''}`}
            onClick={() => setActiveTab(c.id)}
            role="tab"
            aria-selected={c.id === activeTab}
          >
            <span className="chip-ico"><c.Icon size={13} /></span>
            {c.name}
          </button>
        ))}
      </div>

      <table className="notif-table">
        <thead>
          <tr>
            <th>Notification type</th>
            <th className="c">Enable notification</th>
          </tr>
        </thead>
        <tbody>
          {BUCKETS.map((bucket) => (
            <React.Fragment key={bucket.name}>
              <tr className="bucket-row"><td colSpan={2}>{bucket.name}</td></tr>
              {bucket.items.map((item) => (
                <ActivityRow
                  key={item.id}
                  label={item.label}
                  enabled={state[activeTab][item.id]}
                  onToggle={() => toggleActivity(activeTab, item.id)}
                />
              ))}
            </React.Fragment>
          ))}
          {specificItems.length > 0 && (
            <>
              <tr className="bucket-row"><td colSpan={2}>Only on {activeChannel.name}</td></tr>
              {specificItems.map((item) => (
                <ActivityRow
                  key={item.id}
                  label={item.label}
                  enabled={state[activeTab][item.id]}
                  onToggle={() => toggleActivity(activeTab, item.id)}
                  onlyHere
                />
              ))}
            </>
          )}
        </tbody>
      </table>
    </>
  );
}

function ActivityRow({ label, enabled, onToggle, onlyHere }) {
  return (
    <tr className="item-row">
      <td>
        <span className="n-type">{label}</span>
        {onlyHere && <span className="only-here-pill">Only here</span>}
      </td>
      <td className="c">
        <button className={`hs-switch ${enabled ? 'on' : ''}`} role="switch" aria-checked={enabled} onClick={onToggle}>
          <span className="hs-switch-handle" />
        </button>
      </td>
    </tr>
  );
}

function ActivityFirst({ state, toggleActivity, setActivityForAllChannels }) {
  // Trailing bucket for channel-specific activities, each only applicable to its own channel
  const specificRows = CHANNELS.flatMap((c) => (SPECIFIC[c.id] || []).map((item) => ({ ...item, ownerId: c.id })));

  return (
    <div className="grid-scroll">
      <table className="notif-table grid-table">
        <thead>
          <tr>
            <th>Notify me when&hellip;</th>
            {CHANNELS.map((c) => (
              <th className="c" key={c.id}>
                <span className="grid-col-head">
                  <c.Icon size={13} />
                  {c.name}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {BUCKETS.map((bucket) => (
            <React.Fragment key={bucket.name}>
              <tr className="bucket-row"><td colSpan={CHANNELS.length + 1}>{bucket.name}</td></tr>
              {bucket.items.map((item) => {
                const allOn = CHANNELS.every((c) => state[c.id][item.id]);
                return (
                  <tr className="item-row" key={item.id}>
                    <td>
                      <span className="n-type-row">
                        <span className="n-type">{item.label}</span>
                        <button
                          type="button"
                          className="row-all-toggle"
                          onClick={() => setActivityForAllChannels(item.id, !allOn)}
                        >
                          <CheckCheck size={12} />
                          {allOn ? 'Turn off for all' : 'Turn on for all'}
                        </button>
                      </span>
                    </td>
                    {CHANNELS.map((c) => (
                      <td className="c" key={c.id}>
                        <Checkbox checked={state[c.id][item.id]} onChange={() => toggleActivity(c.id, item.id)} />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </React.Fragment>
          ))}

          {specificRows.length > 0 && (
            <>
              <tr className="bucket-row"><td colSpan={CHANNELS.length + 1}>Channel-specific</td></tr>
              {specificRows.map((item) => (
                <tr className="item-row" key={item.id}>
                  <td><span className="n-type">{item.label}</span></td>
                  {CHANNELS.map((c) => {
                    if (c.id !== item.ownerId) {
                      return (
                        <td className="c na-cell" key={c.id}>
                          <span className="na-dash" title={`Not available for ${c.name}`}>
                            &mdash;
                          </span>
                        </td>
                      );
                    }
                    return (
                      <td className="c" key={c.id}>
                        <Checkbox
                          checked={state[c.id][item.id]}
                          onChange={() => toggleActivity(c.id, item.id)}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Checkbox({ checked, onChange }) {
  return (
    <button
      className={`hs-checkbox ${checked ? 'checked' : ''}`}
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
    >
      {checked && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

export default NotificationSettings;
