import React, { useState, useEffect, useRef } from 'react';
import initialData from './data/prd-data.json';
import { PrdTree } from './components/PrdTree';
import './index.css';

// Helper to generate IDs
const generateId = (type) => `${type.charAt(0)}-${Math.random().toString(36).substr(2, 6)}`;

function App() {
  const [prdData, setPrdData] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const savedData = localStorage.getItem('routemates_prd_data');
    if (savedData) {
      try {
        setPrdData(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to parse local storage data");
        setPrdData(initialData);
      }
    } else {
      setPrdData(initialData);
    }
  }, []);

  useEffect(() => {
    if (prdData.length > 0) {
      localStorage.setItem('routemates_prd_data', JSON.stringify(prdData));
    }
  }, [prdData]);

  const updateNode = (nodes, id, updates) => {
    return nodes.map(node => {
      if (node.id === id) {
        return { ...node, ...updates };
      }
      if (node.children) {
        return { ...node, children: updateNode(node.children, id, updates) };
      }
      return node;
    });
  };

  const deleteNode = (nodes, id) => {
    return nodes.filter(node => {
      if (node.id === id) return false;
      if (node.children) {
        node.children = deleteNode(node.children, id);
      }
      return true;
    });
  };

  const addNodeToParent = (nodes, parentId, newNode) => {
    return nodes.map(node => {
      if (node.id === parentId) {
        return {
          ...node,
          children: [...(node.children || []), newNode]
        };
      }
      if (node.children) {
        return { ...node, children: addNodeToParent(node.children, parentId, newNode) };
      }
      return node;
    });
  };

  const addAttachmentToNode = (nodes, id, attachment) => {
    return nodes.map(node => {
      if (node.id === id) {
        return {
          ...node,
          attachments: [...(node.attachments || []), attachment]
        };
      }
      if (node.children) {
        return { ...node, children: addAttachmentToNode(node.children, id, attachment) };
      }
      return node;
    });
  };

  const deleteAttachmentFromNode = (nodes, id, attachmentIndex) => {
    return nodes.map(node => {
      if (node.id === id) {
        const newAttachments = [...(node.attachments || [])];
        newAttachments.splice(attachmentIndex, 1);
        return { ...node, attachments: newAttachments };
      }
      if (node.children) {
        return { ...node, children: deleteAttachmentFromNode(node.children, id, attachmentIndex) };
      }
      return node;
    });
  };

  const handleUpdate = (id, updates) => setPrdData(prev => updateNode(prev, id, updates));
  const handleDelete = (id) => setPrdData(prev => deleteNode(prev, id));
  
  const handleAddChild = (parentId, childType) => {
    const newNode = {
      id: generateId(childType),
      title: 'New ' + childType,
      type: childType,
      description: '',
      status: 'Todo',
      children: [],
      attachments: []
    };
    if (parentId) {
      setPrdData(prev => addNodeToParent(prev, parentId, newNode));
    } else {
      setPrdData(prev => [...prev, newNode]);
    }
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
      setPrdData(prev => addAttachmentToNode(prev, id, attachment));
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteAttachment = (id, index) => {
    setPrdData(prev => deleteAttachmentFromNode(prev, id, index));
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(prdData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "routemates_prd.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (Array.isArray(importedData)) {
          setPrdData(importedData);
          alert("PRD data imported successfully!");
        } else {
          alert("Invalid file format. Please upload a valid PRD JSON array.");
        }
      } catch (err) {
        alert("Error parsing JSON file.");
      }
    };
    reader.readAsText(file);
    event.target.value = null;
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset to the original default PRD data? All unsaved local changes will be lost.")) {
      setPrdData(initialData);
    }
  };

  return (
    <div className="app-container">
      <header>
        <div>
          <h1>Routemates PRD</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Interactive Agile Management Platform
          </p>
        </div>
        <div className="header-actions">
          <button className="btn" onClick={() => handleAddChild(null, 'Epic')}>
            + New Epic
          </button>
          <button className="btn" onClick={handleReset} title="Reset to original seed data">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
            Reset
          </button>
          <input 
            type="file" 
            accept=".json" 
            style={{ display: 'none' }} 
            ref={fileInputRef}
            onChange={handleImport}
          />
          <button className="btn" onClick={() => fileInputRef.current.click()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            Import JSON
          </button>
          <button className="btn btn-primary" onClick={handleExport}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Export to GitHub
          </button>
        </div>
      </header>

      <main className="glass-panel" style={{ padding: '2rem' }}>
        <PrdTree 
          data={prdData} 
          onUpdate={handleUpdate} 
          onDelete={handleDelete}
          onAddChild={handleAddChild}
          onAddAttachment={handleAddAttachment}
          onDeleteAttachment={handleDeleteAttachment}
        />
      </main>
    </div>
  );
}

export default App;
