import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { extractActionItems } from '../services/openai.js';

const prisma = new PrismaClient();

function toDate(value) {
  if (value == null || value === '') return null;
  if (value instanceof Date) return value;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function mapItem(item) {
  return {
    id: item.id,
    task: item.task,
    owner: item.owner,
    dueDate: item.dueDate ? item.dueDate.toISOString() : null,
    tags: item.tags ?? [],
    done: item.status === 'done',
  };
}

export async function createTranscript(req, res) {
  try {
    const text = req.body?.text;
    if (typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Missing or invalid field: text (non-empty string required).' });
    }

    const rawItems = await extractActionItems(text.trim());

    const transcript = await prisma.transcript.create({
      data: {
        text: text.trim(),
        items: {
          create: rawItems.map((raw) => ({
            task: raw.task,
            owner: raw.owner,
            dueDate: toDate(raw.due_date),
            tags: raw.tags,
          })),
        },
      },
      include: { items: true },
    });

    const actionItems = transcript.items.map(mapItem);
    return res.status(201).json({ actionItems });
  } catch (err) {
    const message = err?.message || 'Failed to extract action items.';
    console.error('createTranscript error:', err);
    if (err.message?.includes('OpenAI') || err.message?.includes('API key') || err.message?.includes('Invalid JSON') || err.message?.includes('rate limit') || err.message?.includes('quota') || err.message?.includes('Could not reach')) {
      return res.status(502).json({ error: message });
    }
    if (err.code === 'P2002' || err.code === 'P2003' || err.code?.startsWith('P')) {
      return res.status(500).json({ error: 'Database error. Please try again.' });
    }
    return res.status(500).json({ error: message });
  }
}

export async function listTranscripts(req, res) {
  try {
    const transcripts = await prisma.transcript.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { items: true } } },
    });

    const result = transcripts.map((t) => ({
      id: t.id,
      text: t.text,
      createdAt: t.createdAt.toISOString(),
      itemCount: t._count.items,
    }));

    return res.json(result);
  } catch (err) {
    console.error('listTranscripts error:', err);
    return res.status(500).json({ error: 'Failed to load transcripts.' });
  }
}

export async function getTranscriptItems(req, res) {
  try {
    const { transcriptId } = req.params;
    const items = await prisma.actionItem.findMany({
      where: { transcriptId },
      orderBy: { createdAt: 'asc' },
    });
    return res.json(items.map(mapItem));
  } catch (err) {
    console.error('getTranscriptItems error:', err);
    return res.status(500).json({ error: 'Failed to load transcript items.' });
  }
}
