import React, { useState } from 'react';

const StatusIndicator = ({ status }) => {
  const safeStatus = status ? status.replace(' ', '-') : 'Todo';
  return <span className={`status-indicator status-${safeStatus}`} title={status} />;
};

const getChildType = (currentType) => {
  switch (currentType) {
    case 'Epic': return 'Story';
    case 'Story': return 'Task';
    case 'Task': return 'Subtask';
    case 'Subtask': return 'Subtask';
    default: return 'Task';
  }
};

export const PrdNode = ({ node, level = 0, selectedNodeId, onSelectNode, onUpdate, onDelete, onAddChild }) => {
  const [isExpanded, setIsExpanded] = useState(level <= 2);
  
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedNodeId === node.id;
  
  const handleToggle = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleSelect = (e) => {
    e.stopPropagation();
    onSelectNode(node.id);
  };

  const handleStatusChange = (e) => {
    e.stopPropagation();
    onUpdate(node.id, { status: e.target.value });
  };

  return (
    <div className="tree-node animate-fade-in" style={{ animationDelay: `${level * 0.05}s` }}>
      <div className={`node-content ${isSelected ? 'selected' : ''}`} onClick={handleSelect}>
        <div className="node-header">
          <div 
            className={`node-toggle ${isExpanded ? 'expanded' : ''}`} 
            style={{ visibility: hasChildren ? 'visible' : 'hidden' }}
            onClick={handleToggle}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
          <span className={`node-type-badge type-${node.type}`}>{node.type}</span>
          
          <span className="node-title" title={node.title}>{node.title}</span>
          
          <div className="tree-labels">
            {node.priority && node.priority !== 'Medium' && (
              <span className={`priority-badge priority-${node.priority}`}>
                {node.priority === 'High' ? '↑' : '↓'} {node.priority}
              </span>
            )}
            {node.assignee && (
              <span className="assignee-badge">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                {node.assignee}
              </span>
            )}
            {node.labels && node.labels.slice(0, 2).map(l => (
              <span key={l} className="tree-label">{l}</span>
            ))}
            {node.labels && node.labels.length > 2 && (
              <span className="tree-label">+{node.labels.length - 2}</span>
            )}
            {node.attachments && node.attachments.length > 0 && (
              <span className="tree-label" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                {node.attachments.length}
              </span>
            )}
          </div>
        </div>
        
        <div className="node-actions" onClick={e => e.stopPropagation()}>
          <button className="btn btn-small" onClick={(e) => { e.stopPropagation(); onAddChild(node.id, getChildType(node.type)); setIsExpanded(true); }}>
            + {getChildType(node.type)}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: '0.5rem' }}>
            <StatusIndicator status={node.status} />
          </div>
          <button className="btn btn-small btn-danger" onClick={(e) => { e.stopPropagation(); if(window.confirm('Delete this node and all children?')) onDelete(node.id); }}>
            ✕
          </button>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="node-children">
          {node.children.map(child => (
            <PrdNode 
              key={child.id} 
              node={child} 
              level={level + 1} 
              selectedNodeId={selectedNodeId}
              onSelectNode={onSelectNode}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const PrdTree = ({ data, selectedNodeId, onSelectNode, onUpdate, onDelete, onAddChild }) => {
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
          selectedNodeId={selectedNodeId}
          onSelectNode={onSelectNode}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onAddChild={onAddChild}
        />
      ))}
    </div>
  );
};
