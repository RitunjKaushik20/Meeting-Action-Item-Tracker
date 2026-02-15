function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now - date;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      return diffMinutes <= 1 ? 'Just now' : `${diffMinutes} minutes ago`;
    }
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

function truncateText(text, maxLength = 60) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

function History({ transcripts, selectedId, onSelect }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Recent Transcripts
      </h2>
      
      {transcripts.length === 0 ? (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">
            No transcripts yet. Extract action items to see them here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {transcripts.map((transcript) => (
            <button
              key={transcript.id}
              onClick={() => onSelect(transcript.id)}
              className={`w-full text-left p-4 rounded-lg border transition-all ${
                selectedId === transcript.id
                  ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  selectedId === transcript.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {transcript.itemCount || 0} items
                </span>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {formatDate(transcript.createdAt)}
                </span>
              </div>
              <p className="text-sm text-gray-700 line-clamp-2">
                {truncateText(transcript.text)}
              </p>
            </button>
          ))}
        </div>
      )}
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">
          Showing last {transcripts.length} transcripts
        </p>
      </div>
    </div>
  );
}

export default History;
