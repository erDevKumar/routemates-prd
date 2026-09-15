import React from 'react';

const StatusBadge = ({ status }) => {
  const safeStatus = status ? status.replace(' ', '-') : 'Todo';
  return <span className={`doc-badge doc-status-${safeStatus}`}>{status}</span>;
};

const PriorityBadge = ({ priority }) => {
  if (!priority || priority === 'Medium') return null;
  return <span className={`doc-badge doc-priority-${priority}`}>{priority}</span>;
};

const AssigneeBadge = ({ assignee }) => {
  if (!assignee) return null;
  return (
    <span className="doc-badge doc-assignee">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
      {assignee}
    </span>
  );
};

const LabelsBadge = ({ labels }) => {
  if (!labels || labels.length === 0) return null;
  return (
    <>
      {labels.map(l => (
        <span key={l} className="doc-badge doc-label">{l}</span>
      ))}
    </>
  );
};

const DocumentNode = ({ node, level }) => {
  const HeadingTag = `h${Math.min(level + 1, 6)}`;
  
  return (
    <div className={`doc-node doc-level-${level}`}>
      <div className="doc-node-header">
        <HeadingTag className={`doc-heading type-${node.type}`}>{node.title}</HeadingTag>
        <div className="doc-badges">
          <span className={`node-type-badge type-${node.type}`}>{node.type}</span>
          <StatusBadge status={node.status} />
          <PriorityBadge priority={node.priority} />
          <AssigneeBadge assignee={node.assignee} />
          <LabelsBadge labels={node.labels} />
        </div>
      </div>
      
      {node.description && (
        <div className="doc-description">
          {node.description.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}

      {node.attachments && node.attachments.length > 0 && (
        <div className="doc-attachments">
          {node.attachments.map((att, idx) => (
            <div key={idx} className="doc-attachment-item">
              {att.type.startsWith('image/') ? (
                <img src={att.data} alt={att.name} className="doc-inline-image" />
              ) : (
                <div className="doc-file-link">📎 {att.name}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {node.children && node.children.length > 0 && (
        <div className="doc-children">
          {node.children.map(child => (
            <DocumentNode key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const DocumentView = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="empty-state glass-panel" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>No PRD data available to generate document.</p>
      </div>
    );
  }

  return (
    <div className="document-view-container glass-panel">
      <div className="document-content">
        <div className="document-title-page">
          <h1>Product Requirements Document</h1>
          <p className="doc-meta">Generated from Routemates Agile Board</p>
          <hr className="doc-divider" />
        </div>
        
        {data.map(epic => (
          <DocumentNode key={epic.id} node={epic} level={0} />
        ))}
        
        <div className="doc-footer">
          <p>End of Document</p>
        </div>
      </div>
    </div>
  );
};
