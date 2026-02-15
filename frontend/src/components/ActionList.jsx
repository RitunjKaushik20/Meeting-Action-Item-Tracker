import ActionItem from './ActionItem';

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100">
      <td className="px-4 py-3">
        <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
      </td>
      <td className="px-4 py-3">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
      </td>
      <td className="px-4 py-3">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
      </td>
      <td className="px-4 py-3">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-1">
          <div className="h-5 w-12 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="h-5 w-12 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-1">
          <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </td>
    </tr>
  );
}

function ActionList({ items, loading, onUpdate, onDelete, onToggleDone }) {
  if (loading && items.length === 0) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 text-left text-sm font-medium text-gray-500">
              <th className="px-4 py-2 w-12">Done</th>
              <th className="px-4 py-2">Task</th>
              <th className="px-4 py-2">Owner</th>
              <th className="px-4 py-2">Due Date</th>
              <th className="px-4 py-2">Tags</th>
              <th className="px-4 py-2 w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </tbody>
        </table>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No action items yet</h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          Paste a meeting transcript and click "Extract Action Items" to get started
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 text-left text-sm font-medium text-gray-500">
            <th className="px-4 py-2 w-12">Done</th>
            <th className="px-4 py-2">Task</th>
            <th className="px-4 py-2">Owner</th>
            <th className="px-4 py-2">Due Date</th>
            <th className="px-4 py-2">Tags</th>
            <th className="px-4 py-2 w-24">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <ActionItem
              key={item.id}
              item={item}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onToggleDone={onToggleDone}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ActionList;
