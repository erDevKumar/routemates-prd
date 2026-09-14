import React, { useRef, useState } from 'react';

export const JiraDetailPanel = ({ node, onUpdate, onAddAttachment, onDeleteAttachment }) => {
  const fileInputRef = useRef(null);
  const [tagInput, setTagInput] = useState('');

  if (!node) {
    return (
      <div className="empty-state glass-panel" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem', opacity: 0.5 }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <h3>Select an issue to view details</h3>
          <p>Click on any Epic, Story, or Task from the left panel.</p>
        </div>
      </div>
    );
  }

  const handleChange = (field, value) => {
    onUpdate(node.id, { [field]: value });
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const currentLabels = node.labels || [];
      if (!currentLabels.includes(tagInput.trim())) {
        handleChange('labels', [...currentLabels, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    const currentLabels = node.labels || [];
    handleChange('labels', currentLabels.filter(t => t !== tagToRemove));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File is too large! Max 2MB.");
        e.target.value = null;
        return;
      }
      onAddAttachment(node.id, file);
      e.target.value = null;
    }
  };

  const labels = node.labels || [];

  return (
    <div className="detail-panel glass-panel">
      <div className="detail-header">
        <span className={`node-type-badge type-${node.type}`}>{node.type}</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ID: {node.id.split('-')[1]}</span>
      </div>

      <div className="detail-content">
        <div className="detail-main">
          <input 
            className="detail-title-input" 
            value={node.title} 
            onChange={e => handleChange('title', e.target.value)} 
            placeholder="Issue Title"
          />
          
          <div className="field-group" style={{ marginTop: '1.5rem' }}>
            <span className="field-label">Description</span>
            <textarea 
              className="detail-textarea" 
              value={node.description || ''} 
              onChange={e => handleChange('description', e.target.value)} 
              placeholder="Add detailed description or acceptance criteria..."
            />
          </div>

          <div className="attachments-section">
            <span className="field-label" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              Attachments
              <button className="btn-small" onClick={() => fileInputRef.current.click()} style={{ padding: 0 }}>+ Add File</button>
            </span>
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
            
            {(!node.attachments || node.attachments.length === 0) ? (
               <div className="dropzone" onClick={() => fileInputRef.current.click()}>
                 Drop files here or click to attach (Max 2MB)
               </div>
            ) : (
              <div className="attachments-grid">
                {node.attachments.map((att, idx) => (
                  <div key={idx} className="attachment-card">
                    <button className="attachment-delete" onClick={() => { if(window.confirm('Delete attachment?')) onDeleteAttachment(node.id, idx); }}>✕</button>
                    {att.type.startsWith('image/') ? (
                      <img src={att.data} alt={att.name} />
                    ) : (
                      <div className="file-icon">DOC</div>
                    )}
                    <span className="attachment-name" title={att.name}>{att.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="detail-sidebar">
          <div className="field-group">
            <span className="field-label">Status</span>
            <select className="detail-select" value={node.status || 'Todo'} onChange={e => handleChange('status', e.target.value)}>
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>

          <div className="field-group">
            <span className="field-label">Priority</span>
            <select className="detail-select" value={node.priority || 'Medium'} onChange={e => handleChange('priority', e.target.value)}>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="field-group">
            <span className="field-label">Assignee</span>
            <input 
              className="detail-input" 
              value={node.assignee || ''} 
              onChange={e => handleChange('assignee', e.target.value)} 
              placeholder="Unassigned"
            />
          </div>

          <div className="field-group">
            <span className="field-label">Labels</span>
            <div className="tags-input-container">
              {labels.map(tag => (
                <span key={tag} className="tag-badge">
                  {tag}
                  <button onClick={() => handleRemoveTag(tag)}>✕</button>
                </span>
              ))}
              <input 
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder={labels.length === 0 ? "Add label..." : ""}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
