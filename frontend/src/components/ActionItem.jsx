import { useState } from 'react';

const tagColors = [
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-green-100 text-green-700 border-green-200',
  'bg-purple-100 text-purple-700 border-purple-200',
  'bg-orange-100 text-orange-700 border-orange-200',
  'bg-pink-100 text-pink-700 border-pink-200',
  'bg-teal-100 text-teal-700 border-teal-200',
];

function getTagColor(index) {
  return tagColors[index % tagColors.length];
}

function isOverdue(dueDate) {
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  return due < today;
}

function isDueSoon(dueDate) {
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= 2;
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function ActionItem({ item, onUpdate, onDelete, onToggleDone }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(item.task);
  const [editedOwner, setEditedOwner] = useState(item.owner || '');
  const [editedDueDate, setEditedDueDate] = useState(item.dueDate ? item.dueDate.split('T')[0] : '');
  const [editedTags, setEditedTags] = useState(item.tags ? item.tags.join(', ') : '');

  const handleSave = () => {
    onUpdate(item.id, {
      task: editedTask,
      owner: editedOwner,
      dueDate: editedDueDate || null,
      tags: editedTags.split(',').map(tag => tag.trim()).filter(tag => tag)
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTask(item.task);
    setEditedOwner(item.owner || '');
    setEditedDueDate(item.dueDate ? item.dueDate.split('T')[0] : '');
    setEditedTags(item.tags ? item.tags.join(', ') : '');
    setIsEditing(false);
  };

  const dueDateClass = item.done ? 'text-gray-400' : 
    isOverdue(item.dueDate) ? 'text-red-600 font-medium' :
    isDueSoon(item.dueDate) ? 'text-yellow-600 font-medium' : 'text-gray-600';

  const dueDateBgClass = item.done ? '' :
    isOverdue(item.dueDate) ? 'bg-red-50 px-2 py-0.5 rounded' :
    isDueSoon(item.dueDate) ? 'bg-yellow-50 px-2 py-0.5 rounded' : '';

  if (isEditing) {
    return (
      <tr className="bg-primary-50">
        <td className="px-4 py-3">
          <input
            type="checkbox"
            checked={item.done}
            onChange={(e) => onToggleDone(item.id, e.target.checked)}
            className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
          />
        </td>
        <td className="px-4 py-3">
          <input
            type="text"
            value={editedTask}
            onChange={(e) => setEditedTask(e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </td>
        <td className="px-4 py-3">
          <input
            type="text"
            value={editedOwner}
            onChange={(e) => setEditedOwner(e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Owner"
          />
        </td>
        <td className="px-4 py-3">
          <input
            type="date"
            value={editedDueDate}
            onChange={(e) => setEditedDueDate(e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </td>
        <td className="px-4 py-3">
          <input
            type="text"
            value={editedTags}
            onChange={(e) => setEditedTags(e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="tag1, tag2, tag3"
          />
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="p-1.5 text-green-600 hover:bg-green-100 rounded"
              title="Save"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button
              onClick={handleCancel}
              className="p-1.5 text-red-600 hover:bg-red-100 rounded"
              title="Cancel"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className={`border-b border-gray-100 hover:bg-gray-50 ${item.done ? 'opacity-60' : ''}`}>
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={item.done}
          onChange={(e) => onToggleDone(item.id, e.target.checked)}
          className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
        />
      </td>
      <td className="px-4 py-3">
        <span className={`text-gray-800 ${item.done ? 'line-through' : ''}`}>
          {item.task}
        </span>
      </td>
      <td className="px-4 py-3 text-gray-600">
        {item.owner || '-'}
      </td>
      <td className="px-4 py-3">
        <span className={`${dueDateClass} ${dueDateBgClass}`}>
          {item.dueDate ? formatDate(item.dueDate) : '-'}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {item.tags && item.tags.map((tag, index) => (
            <span
              key={index}
              className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getTagColor(index)}`}
            >
              {tag}
            </span>
          ))}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded"
            title="Edit"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
            title="Delete"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}

export default ActionItem;
