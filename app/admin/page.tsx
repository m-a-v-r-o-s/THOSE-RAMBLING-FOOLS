'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  FREQUENCIES,
  FREQUENCY_LABELS,
  WEEKDAYS,
  formatWhen,
  type Frequency,
  type Gig,
} from '@/lib/gig-format';
import styles from './admin.module.css';

const EMPTY = {
  name: '',
  location: '',
  mapUrl: '',
  time: '',
  frequency: 'once' as Frequency,
  weekday: 0,
  onceDate: '',
  customDates: [''] as string[],
};

export default function AdminPage() {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formCardRef = useRef<HTMLElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/admin/api/gigs', { cache: 'no-store' });
      if (!res.ok) throw new Error();
      setGigs(await res.json());
      setError(null);
    } catch {
      setError('Could not load gigs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setField =
    (key: 'name' | 'location' | 'mapUrl' | 'time') =>
    (e: ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  function setCustomDate(index: number, value: string) {
    setForm((f) => {
      const dates = [...f.customDates];
      dates[index] = value;
      return { ...f, customDates: dates };
    });
  }

  function addCustomDate() {
    setForm((f) => ({ ...f, customDates: [...f.customDates, ''] }));
  }

  function removeCustomDate(index: number) {
    setForm((f) => {
      const dates = f.customDates.filter((_, i) => i !== index);
      return { ...f, customDates: dates.length ? dates : [''] };
    });
  }

  function startEdit(gig: Gig) {
    setEditingId(gig.id);
    setError(null);
    setForm({
      name: gig.name,
      location: gig.location ?? '',
      mapUrl: gig.mapUrl ?? '',
      time: gig.time ?? '',
      frequency: gig.frequency ?? 'once',
      weekday: gig.weekday ?? 0,
      onceDate: gig.frequency === 'once' ? gig.dates?.[0] ?? '' : '',
      customDates:
        gig.frequency === 'custom' && gig.dates?.length ? gig.dates : [''],
    });
    formCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY);
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('The venue/bar name is required.');
      return;
    }

    let dates: string[] | undefined;
    if (form.frequency === 'once') {
      if (!form.onceDate) {
        setError('Pick a date for the gig.');
        return;
      }
      dates = [form.onceDate];
    } else if (form.frequency === 'custom') {
      dates = form.customDates.filter(Boolean);
      if (dates.length === 0) {
        setError('Add at least one date.');
        return;
      }
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(
        editingId ? `/admin/api/gigs/${editingId}` : '/admin/api/gigs',
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            location: form.location,
            mapUrl: form.mapUrl,
            time: form.time,
            frequency: form.frequency,
            weekday: form.weekday,
            dates,
          }),
        }
      );
      if (!res.ok) throw new Error();
      setForm(EMPTY);
      setEditingId(null);
      await load();
    } catch {
      setError(
        editingId ? 'Could not save changes. Try again.' : 'Could not add the gig. Try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Keep the focused field visible above the mobile keyboard.
  function handleFocus(e: React.FocusEvent<HTMLElement>) {
    const el = e.target;
    if (!(el instanceof HTMLInputElement || el instanceof HTMLSelectElement)) return;
    // Wait for the keyboard to open so the field scrolls above it.
    window.setTimeout(() => {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 300);
  }

  // Enter moves to the next field (and scrolls it into view); on the last
  // field it submits. This keeps mobile data entry flowing field-to-field.
  function handleKeyDown(e: React.KeyboardEvent<HTMLFormElement>) {
    if (e.key !== 'Enter') return;
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.tagName === 'TEXTAREA') return;

    e.preventDefault();
    const form = e.currentTarget;
    const fields = Array.from(
      form.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input, select')
    ).filter((el) => !el.disabled);
    const index = fields.indexOf(target as HTMLInputElement | HTMLSelectElement);
    const next = index >= 0 ? fields[index + 1] : undefined;

    if (next) {
      next.focus();
      window.setTimeout(() => {
        next.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }, 100);
    } else {
      form.requestSubmit();
    }
  }

  async function handleLogout() {
    try {
      await fetch('/admin/api/logout', { method: 'POST' });
    } catch {
      // ignore — navigate away regardless
    }
    window.location.href = '/admin/login';
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete "${name}"?`)) return;
    setError(null);
    try {
      const res = await fetch(`/admin/api/gigs/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      await load();
    } catch {
      setError('Could not delete the gig. Try again.');
    }
  }

  const isRecurring = form.frequency === 'weekly' || form.frequency === 'biweekly';

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>Gigs Admin</h1>
      <p className={styles.subtitle}>
        Add upcoming gigs and remove old ones. Changes go live on the Upcoming Gigs page immediately.
      </p>

      <div className={styles.topBar}>
        <Link href="/upcoming-gigs" className={styles.topLink}>
          View live gig list
        </Link>
        <button type="button" className={styles.logout} onClick={handleLogout}>
          Log out
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <section className={styles.card} ref={formCardRef}>
        <p className={styles.sectionLabel}>{editingId ? 'Edit gig' : 'Add a gig'}</p>
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} onFocus={handleFocus}>
          <div className={styles.field}>
            <label htmlFor="name">Venue / name *</label>
            <input id="name" value={form.name} onChange={setField('name')} placeholder="Venue or bar name" enterKeyHint="next" />
          </div>
          <div className={styles.field}>
            <label htmlFor="location">Location</label>
            <input id="location" value={form.location} onChange={setField('location')} placeholder="City or area" enterKeyHint="next" />
          </div>

          <div className={styles.field}>
            <label htmlFor="frequency">Repeats</label>
            <select
              id="frequency"
              value={form.frequency}
              onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value as Frequency }))}
            >
              {FREQUENCIES.map((freq) => (
                <option key={freq} value={freq}>
                  {FREQUENCY_LABELS[freq]}
                </option>
              ))}
            </select>
          </div>

          {isRecurring && (
            <div className={styles.field}>
              <label htmlFor="weekday">Day of week</label>
              <select
                id="weekday"
                value={String(form.weekday)}
                onChange={(e) => setForm((f) => ({ ...f, weekday: Number(e.target.value) }))}
              >
                {WEEKDAYS.map((day, i) => (
                  <option key={day} value={i}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
          )}

          {form.frequency === 'once' && (
            <div className={styles.field}>
              <label htmlFor="onceDate">Date</label>
              <input
                id="onceDate"
                type="date"
                value={form.onceDate}
                onChange={(e) => setForm((f) => ({ ...f, onceDate: e.target.value }))}
              />
            </div>
          )}

          {form.frequency === 'custom' && (
            <div className={styles.field}>
              <label>Dates</label>
              {form.customDates.map((date, i) => (
                <div className={styles.dateRow} key={i}>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setCustomDate(i, e.target.value)}
                  />
                  {form.customDates.length > 1 && (
                    <button
                      type="button"
                      className={styles.removeDate}
                      onClick={() => removeCustomDate(i)}
                      aria-label="Remove date"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className={styles.addDate} onClick={addCustomDate}>
                + Add another date
              </button>
            </div>
          )}

          <div className={styles.field}>
            <label htmlFor="time">Time</label>
            <input id="time" value={form.time} onChange={setField('time')} placeholder="e.g. 9 pm or about 9 pm" enterKeyHint="next" />
          </div>
          <div className={styles.field}>
            <label htmlFor="mapUrl">Google Maps link</label>
            <input id="mapUrl" value={form.mapUrl} onChange={setField('mapUrl')} placeholder="Google Maps link (optional)" inputMode="url" enterKeyHint="done" />
          </div>
          <div className={styles.formActions}>
            <button className={styles.button} type="submit" disabled={submitting}>
              {submitting
                ? 'Saving…'
                : editingId
                ? 'Save changes'
                : 'Add gig'}
            </button>
            {editingId && (
              <button type="button" className={styles.cancel} onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className={styles.card}>
        <p className={styles.sectionLabel}>Current gigs</p>
        {loading ? (
          <p className={styles.empty}>Loading…</p>
        ) : gigs.length === 0 ? (
          <p className={styles.empty}>No gigs yet — add one above.</p>
        ) : (
          gigs.map((g) => (
            <div
              className={`${styles.gig}${editingId === g.id ? ` ${styles.editing}` : ''}`}
              key={g.id}
            >
              <div>
                <div className={styles.gigName}>{g.name}</div>
                <div className={styles.gigDetails}>
                  {[g.location, formatWhen(g)].filter(Boolean).join(' — ')}
                </div>
                {g.mapUrl && <div className={styles.gigLink}>{g.mapUrl}</div>}
              </div>
              <div className={styles.gigActions}>
                <button className={styles.edit} onClick={() => startEdit(g)}>
                  Edit
                </button>
                <button className={styles.delete} onClick={() => handleDelete(g.id, g.name)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      <Link href="/upcoming-gigs" className={styles.backLink}>
        View live gig list
      </Link>
    </div>
  );
}
