import React from 'react';
import { TicketDraft, TicketPriority, UserContext } from '../types';
import { submitTicketToMCP } from '../services/mcpService';
import { sanitizeContext } from '../utils/sanitizer';

interface Props {
  draft: TicketDraft;
  userContext: UserContext;
  onClose: () => void;
  onSuccess: (id: string) => void;
}

const TicketPreview: React.FC<Props> = ({ draft, userContext, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [editedDraft, setEditedDraft] = React.useState<TicketDraft>(draft);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    // 1. Sanitize Context
    const safeContext = sanitizeContext(userContext);

    // 2. Prepare Payload
    const payload = {
      ...editedDraft,
      user_context: safeContext,
    };

    try {
      const result = await submitTicketToMCP(payload);
      if (result.success && result.ticket_id) {
        onSuccess(result.ticket_id);
      } else {
        setError(result.error || 'Unknown error occurred');
      }
    } catch (e) {
      setError('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-slate-100 p-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800">Review Ticket</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">&times;</button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Title</label>
            <input 
              type="text" 
              value={editedDraft.title}
              onChange={(e) => setEditedDraft({...editedDraft, title: e.target.value})}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Description</label>
            <textarea 
              rows={4}
              value={editedDraft.description}
              onChange={(e) => setEditedDraft({...editedDraft, description: e.target.value})}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Component</label>
              <input 
                type="text" 
                value={editedDraft.component || ''}
                onChange={(e) => setEditedDraft({...editedDraft, component: e.target.value})}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Priority</label>
              <select 
                value={editedDraft.priority}
                onChange={(e) => setEditedDraft({...editedDraft, priority: e.target.value as TicketPriority})}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white"
              >
                {Object.values(TicketPriority).map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
             <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Context (Auto-attached)</label>
             <div className="bg-slate-50 rounded p-2 text-xs text-slate-500 font-mono">
                <p>User: {userContext.user_id}</p>
                <p>Route: {userContext.route}</p>
                <p>Device: {userContext.device}</p>
                <p className="text-emerald-600 italic mt-1">
                   Logs will be sanitized before submission.
                </p>
             </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded text-sm border border-red-200">
              {error}
            </div>
          )}
        </div>

        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-600 text-sm font-medium hover:bg-slate-200 rounded transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 rounded shadow-sm disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {isSubmitting && (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            Submit Ticket
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketPreview;
