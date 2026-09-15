import React, { useState, useEffect } from 'react';
import './App.css';
import { PrdTree } from './components/PrdTree';
import { JiraDetailPanel } from './components/JiraDetailPanel';
import defaultData from './data/prd-data.json';

const generateId = (prefix) => `${prefix}-${Math.floor(Math.random() * 1000000)}`;

// Helper to recursively update a node in the tree
const updateNodeInTree = (nodes, id, updates) => {
  return nodes.map(node => {
    if (node.id === id) {
      return { ...node, ...updates };
    }
    if (node.children && node.children.length > 0) {
      return { ...node, children: updateNodeInTree(node.children, id, updates) };
    }
    return node;
  });
};

// Helper to delete a node
const deleteNodeFromTree = (nodes, id) => {
  return nodes.filter(node => node.id !== id).map(node => {
    if (node.children) {
      return { ...node, children: deleteNodeFromTree(node.children, id) };
    }
    return node;
  });
};

// Helper to add a child to a specific parent
const addNodeToParent = (nodes, parentId, newNode) => {
  return nodes.map(node => {
    if (node.id === parentId) {
      return { ...node, children: [...(node.children || []), newNode] };
    }
    if (node.children && node.children.length > 0) {
      return { ...node, children: addNodeToParent(node.children, parentId, newNode) };
    }
    return node;
  });
};

// Helper to find a node by ID
const findNodeById = (nodes, id) => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

function App() {
  const [prdData, setPrdData] = useState(() => {
    const saved = localStorage.getItem('prdData_v2');
    return saved ? JSON.parse(saved) : defaultData;
  });
  
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  useEffect(() => {
    localStorage.setItem('prdData_v2', JSON.stringify(prdData));
  }, [prdData]);

  const handleUpdateNode = (id, updates) => {
    setPrdData(prev => updateNodeInTree(prev, id, updates));
  };

  const handleDeleteNode = (id) => {
    setPrdData(prev => deleteNodeFromTree(prev, id));
    if (selectedNodeId === id) setSelectedNodeId(null);
  };

  const handleAddChild = (parentId, childType) => {
    const newNode = {
      id: generateId(childType),
      title: 'New ' + childType,
      type: childType,
      description: '',
      status: 'Todo',
      priority: 'Medium',
      assignee: '',
      labels: [],
      children: [],
      attachments: []
    };
    if (parentId) {
      setPrdData(prev => addNodeToParent(prev, parentId, newNode));
    } else {
      setPrdData(prev => [...prev, newNode]);
    }
    setSelectedNodeId(newNode.id);
  };

  const handleAddAttachment = (id, file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target.result;
      const attachment = {
        name: file.name,
        type: file.type,
        data: base64Data
      };
      
      setPrdData(prev => {
        return prev.map(node => updateNodeAttachments(node, id, attachment));
      });
    };
    reader.readAsDataURL(file);
  };

  const updateNodeAttachments = (node, id, newAttachment) => {
    if (node.id === id) {
      return { ...node, attachments: [...(node.attachments || []), newAttachment] };
    }
    if (node.children) {
      return { ...node, children: node.children.map(child => updateNodeAttachments(child, id, newAttachment)) };
    }
    return node;
  };

  const handleDeleteAttachment = (id, attachmentIndex) => {
    setPrdData(prev => {
      return prev.map(node => removeNodeAttachment(node, id, attachmentIndex));
    });
  };

  const removeNodeAttachment = (node, id, index) => {
    if (node.id === id) {
      const newAttachments = [...(node.attachments || [])];
      newAttachments.splice(index, 1);
      return { ...node, attachments: newAttachments };
    }
    if (node.children) {
      return { ...node, children: node.children.map(child => removeNodeAttachment(child, id, index)) };
    }
    return node;
  };

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(prdData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "routemates_prd.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        setPrdData(json);
        setSelectedNodeId(null);
      } catch (err) {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const selectedNode = selectedNodeId ? findNodeById(prdData, selectedNodeId) : null;

  return (
    <div className="app-container">
      <header>
        <div>
          <h1>Routemates PRD</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>Agile Product Requirements Platform</p>
        </div>
        <div className="header-actions">
          <label className="btn">
            Import JSON
            <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
          </label>
          <button className="btn btn-primary" onClick={exportData}>Export to GitHub</button>
        </div>
      </header>

      <div className="two-pane-layout">
        <div className="pane-left glass-panel">
          <div className="pane-header">
            <h3>Hierarchy</h3>
            <button className="btn-small btn-primary" onClick={() => handleAddChild(null, 'Epic')}>+ Epic</button>
          </div>
          <div className="pane-scroll-area">
            <PrdTree 
              data={prdData}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
              onUpdate={handleUpdateNode}
              onDelete={handleDeleteNode}
              onAddChild={handleAddChild}
            />
          </div>
        </div>

        <div className="pane-right">
          <JiraDetailPanel 
            node={selectedNode}
            onUpdate={handleUpdateNode}
            onAddAttachment={handleAddAttachment}
            onDeleteAttachment={handleDeleteAttachment}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
