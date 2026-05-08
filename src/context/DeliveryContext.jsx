import React, { createContext, useContext, useState, useEffect } from 'react';
import Papa from 'papaparse';
import { useAuth } from './AuthContext';

const DeliveryContext = createContext(null);

const SHEET_ID = '1t9TuV4esxRbgNmskZ-IFUhrVKGgajBng';
const GID = '516310149';
const SHEET_CSV_URL = import.meta.env.DEV
  ? `/sheets-proxy/spreadsheets/d/${SHEET_ID}/export?format=csv&id=${SHEET_ID}&gid=${GID}`
  : `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&id=${SHEET_ID}&gid=${GID}`;

const MOCK_AGENTS = [
  { id: 'DA1', name: 'Rahul Sharma', mobile: '9876543210', rating: 4.8 },
  { id: 'DA2', name: 'Suresh Kumar', mobile: '9876543211', rating: 4.5 },
  { id: 'DA3', name: 'Anita Devi', mobile: '9876543212', rating: 4.9 },
  { id: 'DA4', name: 'Vikram Singh', mobile: '9876543213', rating: 4.7 }
];

export const DeliveryProvider = ({ children }) => {
  const [agents, setAgents] = useState(MOCK_AGENTS);
  const [loading, setLoading] = useState(true);
  // assignments: { orderId: { agentId, assignedAt } }
  const [assignments, setAssignments] = useState(() => {
    const saved = localStorage.getItem('bm_delivery_assignments');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Papa.parse(SHEET_CSV_URL, {
      download: true, header: true, skipEmptyLines: true,
      complete: (results) => {
        if (!cancelled) {
          const cleaned = (results.data || [])
            .map(row => {
              const obj = {};
              Object.keys(row).forEach(k => { 
                const key = k.trim();
                obj[key === 'AgentID' ? 'id' : key.toLowerCase()] = (row[k] || '').toString().trim(); 
              });
              // Ensure numeric rating
              if (obj.rating) obj.rating = Number(obj.rating);
              return obj;
            })
            .filter(r => r.id);
          
          if (cleaned.length > 0) {
            setAgents(cleaned);
          }
          setLoading(false);
        }
      },
      error: () => {
        if (!cancelled) setLoading(false);
      },
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    localStorage.setItem('bm_delivery_assignments', JSON.stringify(assignments));
  }, [assignments]);

  const getAvailableAgent = (currentTime) => {
    return agents.find(agent => {
      // Check if this agent is assigned to any order that is still "busy"
      const agentBusyUntil = Object.values(assignments).reduce((max, assignment) => {
        if (assignment.agentId === agent.id) {
          // Agent is busy for 10 minutes after assignment
          const busyUntil = assignment.assignedAt + (10 * 60 * 1000);
          return Math.max(max, busyUntil);
        }
        return max;
      }, 0);
      
      return currentTime >= agentBusyUntil;
    });
  };

  const assignAgent = (orderId, currentTime) => {
    if (assignments[orderId]) return assignments[orderId];

    const agent = getAvailableAgent(currentTime);
    if (agent) {
      const newAssignment = { agentId: agent.id, assignedAt: currentTime };
      setAssignments(prev => ({ ...prev, [orderId]: newAssignment }));
      return newAssignment;
    }
    return null; // No agent available
  };

  const getAgentForOrder = (orderId) => {
    const assignment = assignments[orderId];
    if (!assignment) return null;
    return agents.find(a => a.id === assignment.agentId);
  };

  return (
    <DeliveryContext.Provider value={{ 
      agents, 
      assignments, 
      assignAgent, 
      getAgentForOrder,
      getAvailableAgent 
    }}>
      {children}
    </DeliveryContext.Provider>
  );
};

export const useDelivery = () => {
  const ctx = useContext(DeliveryContext);
  if (!ctx) throw new Error('useDelivery must be used within a DeliveryProvider');
  return ctx;
};
