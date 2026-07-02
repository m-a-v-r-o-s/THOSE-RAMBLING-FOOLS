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
import type { Post } from '@/lib/posts';
import styles from './admin.module.css';

const EMPTY_POST = { title: '', body: '', signature: '' };

function postPreview(body: string, max = 90): string {
  const firstPara = body.split(/\n\s*\n/)[0]?.replace(/\n/g, ' ').trim() ?? '';
  return firstPara.length > max ? `${firstPara.slice(0, max).trimEnd()}…` : firstPara;
}

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

  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postForm, setPostForm] = useState(EMPTY_POST);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [postSubmitting, setPostSubmitting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const postFormCardRef = useRef<HTMLElement>(null);
  const postListRef = useRef<HTMLDivElement>(null);

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

  const loadPosts = useCallback(async () => {
    setPostsLoading(true);
    try {
      const res = await fetch('/admin/api/posts', { cache: 'no-store' });
      if (!res.ok) throw new Error();
      setPosts(await res.json());
      setPostError(null);
    } catch {
      setPostError('Could not load posts.');
    } finally {
      setPostsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    loadPosts();
  }, [load, loadPosts]);

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
    if (
      !(
        el instanceof HTMLInputElement ||
        el instanceof HTMLSelectElement ||
        el instanceof HTMLTextAreaElement
      )
    )
      return;
    // Wait for the keyboard to open so the field scrolls above it.
    window.setTimeout(() => {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 300);
  }

  function startEditPost(post: Post) {
    setEditingPostId(post.id);
    setPostError(null);
    setPostForm({ title: post.title, body: post.body, signature: post.signature });
    postFormCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function cancelEditPost() {
    setEditingPostId(null);
    setPostForm(EMPTY_POST);
    setPostError(null);
  }

  async function handlePostSubmit(e: FormEvent) {
    e.preventDefault();
    if (!postForm.title.trim()) {
      setPostError('A title is required.');
      return;
    }
    setPostSubmitting(true);
    setPostError(null);
    try {
      const res = await fetch(
        editingPostId ? `/admin/api/posts/${editingPostId}` : '/admin/api/posts',
        {
          method: editingPostId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postForm),
        }
      );
      if (!res.ok) throw new Error();
      setPostForm(EMPTY_POST);
      setEditingPostId(null);
      await loadPosts();
    } catch {
      setPostError(
        editingPostId ? 'Could not save changes. Try again.' : 'Could not add the post. Try again.'
      );
    } finally {
      setPostSubmitting(false);
    }
  }

  async function handleDeletePost(id: string, title: string) {
    if (!window.confirm(`Delete "${title}"?`)) return;
    setPostError(null);
    try {
      const res = await fetch(`/admin/api/posts/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || 'Could not delete the post.');
      }
      await loadPosts();
    } catch (err) {
      setPostError(err instanceof Error ? err.message : 'Could not delete the post. Try again.');
    }
  }

  // Drag-to-reorder for the posts list. Uses Pointer Events (unified for
  // mouse/touch/pen) with the handle capturing the pointer, so move/up events
  // keep firing on it wherever the finger/cursor goes.
  function handlePostPointerDown(index: number, e: React.PointerEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragIndex(index);
  }

  function handlePostPointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    if (dragIndex === null) return;
    const container = postListRef.current;
    if (!container) return;
    const rows = Array.from(container.querySelectorAll<HTMLElement>('[data-post-index]'));
    if (rows.length === 0) return;

    const hovered = document.elementFromPoint(e.clientX, e.clientY);
    const row = hovered?.closest<HTMLElement>('[data-post-index]');
    let overIndex: number | null = null;

    if (row) {
      overIndex = Number(row.dataset.postIndex);
    } else {
      const firstRect = rows[0].getBoundingClientRect();
      const lastRect = rows[rows.length - 1].getBoundingClientRect();
      if (e.clientY < firstRect.top) overIndex = 0;
      else if (e.clientY > lastRect.bottom) overIndex = rows.length - 1;
    }

    if (overIndex === null || Number.isNaN(overIndex) || overIndex === dragIndex) return;

    const targetIndex = overIndex;
    setPosts((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setDragIndex(targetIndex);
  }

  async function handlePostPointerUp(e: React.PointerEvent<HTMLButtonElement>) {
    if (dragIndex === null) return;
    setDragIndex(null);
    try {
      const res = await fetch('/admin/api/posts/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: posts.map((p) => p.id) }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setPostError('Could not save the new order. Try again.');
      await loadPosts();
    }
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

      <section className={styles.card} ref={postFormCardRef}>
        <div className={styles.topBar}>
          <p className={styles.sectionLabel}>{editingPostId ? 'Edit post' : 'Add a post'}</p>
          <Link href="/our-story" className={styles.topLink}>
            View live page
          </Link>
        </div>

        <form onSubmit={handlePostSubmit} onFocus={handleFocus}>
          {postError && <p className={styles.error}>{postError}</p>}
          <div className={styles.field}>
            <label htmlFor="postTitle">Title</label>
            <input
              id="postTitle"
              value={postForm.title}
              onChange={(e) => setPostForm((s) => ({ ...s, title: e.target.value }))}
              placeholder="Post title"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="postBody">Text</label>
            <textarea
              id="postBody"
              className={styles.textarea}
              value={postForm.body}
              onChange={(e) => setPostForm((s) => ({ ...s, body: e.target.value }))}
              rows={10}
              placeholder="Leave a blank line between paragraphs."
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="postSignature">Signature</label>
            <input
              id="postSignature"
              value={postForm.signature}
              onChange={(e) => setPostForm((s) => ({ ...s, signature: e.target.value }))}
              placeholder="e.g. —Christos P."
            />
          </div>
          <div className={styles.formActions}>
            <button className={styles.button} type="submit" disabled={postSubmitting}>
              {postSubmitting ? 'Saving…' : editingPostId ? 'Save changes' : 'Add post'}
            </button>
            {editingPostId && (
              <button type="button" className={styles.cancel} onClick={cancelEditPost}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className={styles.card}>
        <p className={styles.sectionLabel}>Ramblings posts</p>
        {posts.length > 1 && (
          <p className={styles.hint}>Drag the handle to reorder. Newest posts start on top.</p>
        )}
        {postsLoading ? (
          <p className={styles.empty}>Loading…</p>
        ) : posts.length === 0 ? (
          <p className={styles.empty}>No posts yet — add one above.</p>
        ) : (
          <div ref={postListRef}>
            {posts.map((post, index) => (
              <div
                key={post.id}
                data-post-index={index}
                className={`${styles.postRow}${dragIndex === index ? ` ${styles.dragging}` : ''}${editingPostId === post.id ? ` ${styles.editing}` : ''}`}
              >
                {posts.length > 1 && (
                  <button
                    type="button"
                    className={styles.dragHandle}
                    onPointerDown={(e) => handlePostPointerDown(index, e)}
                    onPointerMove={handlePostPointerMove}
                    onPointerUp={handlePostPointerUp}
                    onPointerCancel={handlePostPointerUp}
                    aria-label={`Drag to reorder "${post.title}"`}
                  >
                    ⠿
                  </button>
                )}
                <div className={styles.postInfo}>
                  <div className={styles.gigName}>{post.title}</div>
                  <div className={styles.postPreview}>{postPreview(post.body)}</div>
                </div>
                <div className={styles.gigActions}>
                  <button className={styles.edit} onClick={() => startEditPost(post)}>
                    Edit
                  </button>
                  <button
                    className={styles.delete}
                    onClick={() => handleDeletePost(post.id, post.title)}
                    disabled={posts.length <= 1}
                    title={posts.length <= 1 ? 'Keep at least one post' : undefined}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Link href="/upcoming-gigs" className={styles.backLink}>
        View live gig list
      </Link>
    </div>
  );
}
