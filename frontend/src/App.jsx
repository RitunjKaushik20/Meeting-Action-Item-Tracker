import { useState, useEffect } from 'react';
import { API, getApiErrorMessage } from './api';
import TranscriptBox from './components/TranscriptBox';
import ActionList from './components/ActionList';
import Filters from './components/Filters';
import History from './components/History';

function App() {
  const [actionItems, setActionItems] = useState([]);
  const [transcripts, setTranscripts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTranscriptId, setSelectedTranscriptId] = useState(null);

  const fetchActionItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.get('/api/items');
      setActionItems(response.data);
    } catch (err) {
      setError(getApiErrorMessage(err) || 'Failed to load action items. Please try again.');
      console.error('Error fetching action items:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTranscripts = async () => {
    try {
      const response = await API.get('/api/transcripts');
      setTranscripts(response.data.slice(-5).reverse());
    } catch (err) {
      console.error('Error fetching transcripts:', err);
    }
  };

  const handleExtractActionItems = async (text) => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.post('/api/transcript', { text });
      setActionItems(response.data.actionItems || []);
      await fetchTranscripts();
    } catch (err) {
      setError(getApiErrorMessage(err) || 'Failed to extract action items. Please try again.');
      console.error('Error extracting action items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = async (id, updates) => {
    try {
      const response = await API.put(`/api/items/${id}`, updates);
      setActionItems(prev => prev.map(item => 
        item.id === id ? response.data : item
      ));
    } catch (err) {
      setError(getApiErrorMessage(err) || 'Failed to update item. Please try again.');
      console.error('Error updating item:', err);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await API.delete(`/api/items/${id}`);
      setActionItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(getApiErrorMessage(err) || 'Failed to delete item. Please try again.');
      console.error('Error deleting item:', err);
    }
  };

  const handleToggleDone = async (id, done) => {
    try {
      const response = await API.patch(`/api/items/${id}/done`, { done });
      setActionItems(prev => prev.map(item => 
        item.id === id ? response.data : item
      ));
    } catch (err) {
      setError(getApiErrorMessage(err) || 'Failed to update status. Please try again.');
      console.error('Error toggling done status:', err);
    }
  };

  const handleLoadTranscript = async (transcriptId) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedTranscriptId(transcriptId);
      const response = await API.get(`/api/transcripts/${transcriptId}/items`);
      setActionItems(response.data);
    } catch (err) {
      setError(getApiErrorMessage(err) || 'Failed to load transcript items. Please try again.');
      console.error('Error loading transcript:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = actionItems.filter(item => {
    if (filter === 'open') return !item.done;
    if (filter === 'done') return item.done;
    return true;
  });

  useEffect(() => {
    fetchActionItems();
    fetchTranscripts();
  }, []);

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Meeting Action Items Tracker
          </h1>
          <p className="text-gray-600">
            Extract, track, and manage action items from your meeting transcripts
          </p>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <TranscriptBox 
              onExtract={handleExtractActionItems}
              loading={loading}
            />
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Action Items
                </h2>
                <Filters 
                  currentFilter={filter}
                  onFilterChange={setFilter}
                />
              </div>
              
              <ActionList 
                items={filteredItems}
                loading={loading}
                onUpdate={handleUpdateItem}
                onDelete={handleDeleteItem}
                onToggleDone={handleToggleDone}
              />
            </div>
          </div>

          <div className="lg:col-span-1">
            <History 
              transcripts={transcripts}
              selectedId={selectedTranscriptId}
              onSelect={handleLoadTranscript}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
