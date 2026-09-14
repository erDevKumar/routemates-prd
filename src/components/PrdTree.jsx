import React, { useState, useRef } from 'react';

const StatusIndicator = ({ status }) => {
  const safeStatus = status ? status.replace(' ', '-') : 'Todo';
  return <span className={`status-indicator status-${safeStatus}`} title={status} />;
};

const getChildType = (currentType) => {
  switch (currentType) {
    case 'Epic': return 'Story';
    case 'Story': return 'Task';
    case 'Task': return 'Subtask';
    case 'Subtask': return 'Subtask'; // deepest level
    default: return 'Task';
  }
};

export const PrdNode = ({ node, level = 0, onUpdate, onDelete, onAddChild, onAddAttachment, onDeleteAttachment }) => {
  const [isExpanded, setIsExpanded] = useState(level === 0);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(node.title);
  const [editDesc, setEditDesc] = useState(node.description || '');
  const fileInputRef = useRef(null);

  const hasChildren = node.children && node.children.length > 0;
  
  const handleToggle = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleStatusChange = (e) => {
    e.stopPropagation();
    onUpdate(node.id, { status: e.target.value });
  };

  const handleSaveEdit = (e) => {
    e.stopPropagation();
    onUpdate(node.id, { title: editTitle, description: editDesc });
    setIsEditing(false);
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditTitle(node.title);
    setEditDesc(node.description || '');
    setIsEditing(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 2MB to prevent JSON bloat)
      if (file.size > 2 * 1024 * 1024) {
        alert("File is too large! Please keep attachments under 2MB for the static Base64 JSON approach.");
        e.target.value = null;
        return;
      }
      onAddAttachment(node.id, file);
      e.target.value = null;
      setIsExpanded(true); // expand to show attachment
    }
  };

  return (
    <div className="tree-node animate-fade-in" style={{ animationDelay: `${level * 0.05}s` }}>
      <div className="node-content" onClick={handleToggle}>
        <div className="node-header">
          <div 
            className={`node-toggle ${isExpanded ? 'expanded' : ''}`} 
            style={{ visibility: (hasChildren || (node.attachments && node.attachments.length > 0)) ? 'visible' : 'hidden' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
          <span className={`node-type-badge type-${node.type}`}>{node.type}</span>
          
          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }} onClick={e => e.stopPropagation()}>
              <input 
                className="edit-input" 
                value={editTitle} 
                onChange={e => setEditTitle(e.target.value)} 
                placeholder="Title"
                autoFocus
              />
              <input 
                className="edit-input" 
                value={editDesc} 
                onChange={e => setEditDesc(e.target.value)} 
                placeholder="Description"
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-small btn-primary" onClick={handleSaveEdit}>Save</button>
                <button className="btn btn-small" onClick={handleCancelEdit}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <span className="node-title" title={node.title}>{node.title}</span>
              {node.description && <span className="node-desc" title={node.description}>{node.description}</span>}
            </>
          )}
        </div>
        
        {!isEditing && (
          <div className="node-actions" onClick={e => e.stopPropagation()}>
            <button className="btn btn-small" onClick={() => setIsEditing(true)}>Edit</button>
            <button className="btn btn-small" onClick={() => fileInputRef.current.click()}>Attach</button>
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
            <button className="btn btn-small" onClick={() => { onAddChild(node.id, getChildType(node.type)); setIsExpanded(true); }}>
              + {getChildType(node.type)}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', marginLeft: '0.5rem' }}>
              <StatusIndicator status={node.status} />
              <select className="status-select" value={node.status || 'Todo'} onChange={handleStatusChange}>
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
            <button className="btn btn-small btn-danger" onClick={() => { if(window.confirm('Delete this node and all children?')) onDelete(node.id); }}>
              ✕
            </button>
          </div>
        )}
      </div>

      {isExpanded && (node.attachments && node.attachments.length > 0) && (
        <div className="attachments-list">
          {node.attachments.map((att, idx) => (
            <div key={idx} className="attachment-badge">
              {att.type.startsWith('image/') ? (
                <img src={att.data} alt={att.name} />
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
              )}
              <a href={att.data} download={att.name} style={{ color: 'inherit', textDecoration: 'none' }} title="Download">
                {att.name}
              </a>
              <button onClick={() => { if(window.confirm('Delete attachment?')) onDeleteAttachment(node.id, idx); }}>✕</button>
            </div>
          ))}
        </div>
      )}

      {hasChildren && isExpanded && (
        <div className="node-children">
          {node.children.map(child => (
            <PrdNode 
              key={child.id} 
              node={child} 
              level={level + 1} 
              onUpdate={onUpdate}
              onDelete={onDelete}
              onAddChild={onAddChild}
              onAddAttachment={onAddAttachment}
              onDeleteAttachment={onDeleteAttachment}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const PrdTree = ({ data, onUpdate, onDelete, onAddChild, onAddAttachment, onDeleteAttachment }) => {
  if (!data || data.length === 0) {
    return (
      <div className="empty-state glass-panel">
        <p>No PRD data available. Import a JSON file or add a new Epic.</p>
        <button className="btn btn-primary" style={{ margin: '1rem auto' }} onClick={() => onAddChild(null, 'Epic')}>
          + Create First Epic
        </button>
      </div>
    );
  }

  return (
    <div className="tree-container">
      {data.map(epic => (
        <PrdNode 
          key={epic.id} 
          node={epic} 
          level={0} 
          onUpdate={onUpdate}
          onDelete={onDelete}
          onAddChild={onAddChild}
          onAddAttachment={onAddAttachment}
          onDeleteAttachment={onDeleteAttachment}
        />
      ))}
    </div>
  );
};
