import type { CollectionEntry } from 'astro:content';

type Note = CollectionEntry<'notes'>;

export const topicOf = (note: Note) => (note.id.includes('/') ? note.id.split('/')[0] : 'general');

export const topicLabel = (topic: string) =>
  topic === 'control' ? 'Linear Control' : topic.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const byOrder = (a: Note, b: Note) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title);
