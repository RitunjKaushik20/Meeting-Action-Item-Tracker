function Filters({ currentFilter, onFilterChange }) {
  const filters = [
    { key: 'all', label: 'All' },
    { key: 'open', label: 'Open' },
    { key: 'done', label: 'Done' }
  ];

  return (
    <div className="flex items-center gap-2">
      {filters.map(filter => (
        <button
          key={filter.key}
          onClick={() => onFilterChange(filter.key)}
          className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
            currentFilter === filter.key
              ? 'bg-primary-100 text-primary-700 border border-primary-200'
              : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}

export default Filters;
