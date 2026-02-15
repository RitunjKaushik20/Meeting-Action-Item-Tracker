import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

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

function toDate(value) {
  if (value == null || value === '') return null;
  if (value instanceof Date) return value;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function listItems(req, res) {
  try {
    const { transcriptId } = req.query;
    const where = transcriptId ? { transcriptId } : {};
    const items = await prisma.actionItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return res.json(items.map(mapItem));
  } catch (err) {
    console.error('listItems error:', err);
    return res.status(500).json({ error: 'Failed to load action items.' });
  }
}

export async function updateItem(req, res) {
  try {
    const { id } = req.params;
    const { task, owner, dueDate, tags } = req.body;

    const data = {};
    if (task !== undefined) data.task = typeof task === 'string' ? task : String(task);
    if (owner !== undefined) data.owner = owner == null || owner === '' ? null : String(owner);
    if (dueDate !== undefined) data.dueDate = toDate(dueDate);
    if (tags !== undefined) data.tags = Array.isArray(tags) ? tags.map((t) => String(t)).filter(Boolean) : [];

    const item = await prisma.actionItem.update({
      where: { id },
      data,
    });
    return res.json(mapItem(item));
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Action item not found.' });
    }
    console.error('updateItem error:', err);
    return res.status(500).json({ error: 'Failed to update action item.' });
  }
}

export async function toggleDone(req, res) {
  try {
    const { id } = req.params;
    const done = req.body?.done === true;
    const status = done ? 'done' : 'open';

    const item = await prisma.actionItem.update({
      where: { id },
      data: { status },
    });
    return res.json(mapItem(item));
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Action item not found.' });
    }
    console.error('toggleDone error:', err);
    return res.status(500).json({ error: 'Failed to update status.' });
  }
}

export async function deleteItem(req, res) {
  try {
    const { id } = req.params;
    await prisma.actionItem.delete({ where: { id } });
    return res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Action item not found.' });
    }
    console.error('deleteItem error:', err);
    return res.status(500).json({ error: 'Failed to delete action item.' });
  }
}
