// frontend/src/components/RelationshipMatrix.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import './RelationshipMatrix.css';

const API_URL = '/api';

interface ContactInfo {
  id: number;
  name: string;
  type: string;
}

interface Relationship {
  contact1: ContactInfo;
  contact2: ContactInfo;
  relationship: string;
  emoji: string;
  colorCode: string;
  compatibility: number;
  description: string;
  compatibilityText: string;
}

interface MatrixData {
  contacts: ContactInfo[];
  relationships: Relationship[];
  compatibilityLevels: Array<{
    level: number;
    label: string;
    color: string;
  }>;
}

export default function RelationshipMatrix() {
  const [matrixData, setMatrixData] = useState<MatrixData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'type'>('name');
  const [selectedContact, setSelectedContact] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'matrix' | 'list'>('matrix');

  useEffect(() => {
    fetchMatrixData();
  }, []);

  const fetchMatrixData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/contacts/relationships`);
      setMatrixData(response.data);
    } catch (err) {
      setError('Errore nel caricamento delle relazioni');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRelationship = (contactId1: number, contactId2: number) => {
    if (!matrixData) return null;
    return matrixData.relationships.find(
      rel => (rel.contact1.id === contactId1 && rel.contact2.id === contactId2) ||
             (rel.contact1.id === contactId2 && rel.contact2.id === contactId1)
    );
  };

  const getColorClass = (compatibility: number) => {
    switch (compatibility) {
      case 5: return 'compat-high';
      case 4: return 'compat-medium-high';
      case 3: return 'compat-medium';
      case 2: return 'compat-low';
      case 1: return 'compat-very-low';
      default: return '';
    }
  };

  const sortedContacts = matrixData?.contacts
    ? [...matrixData.contacts].sort((a, b) => {
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        } else {
          return a.type.localeCompare(b.type);
        }
      })
    : [];

  // Filtra i contatti se è selezionato uno specifico
  const filteredContacts = selectedContact
    ? sortedContacts.filter(c => c.id === selectedContact)
    : sortedContacts;

  if (loading) {
    return <div className="loading">⏳ Caricamento matrice delle relazioni...</div>;
  }

  if (error) {
    return <div className="error">❌ {error}</div>;
  }

  if (!matrixData || matrixData.contacts.length === 0) {
    return <div className="empty">📭 Aggiungi almeno due contatti per vedere le relazioni</div>;
  }

  return (
    <div className="relationship-matrix">
      <div className="matrix-header">
        <h2>🧭 Matrice delle Relazioni MBTI</h2>
        <p>Compatibilità tra i tuoi contatti basata sui loro tipi di personalità</p>
      </div>

      <div className="matrix-controls">
        <div className="controls-left">
          <button
            className={`view-toggle ${viewMode === 'matrix' ? 'active' : ''}`}
            onClick={() => setViewMode('matrix')}
          >
            🔲 Matrice
          </button>
          <button
            className={`view-toggle ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            📋 Lista
          </button>
        </div>
        <div className="controls-right">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'type')}
            className="sort-select"
          >
            <option value="name">Ordina per Nome</option>
            <option value="type">Ordina per Tipo MBTI</option>
          </select>
          <select
            value={selectedContact || ''}
            onChange={(e) => setSelectedContact(e.target.value ? parseInt(e.target.value) : null)}
            className="filter-select"
          >
            <option value="">Tutti i contatti</option>
            {matrixData.contacts.map(contact => (
              <option key={contact.id} value={contact.id}>
                {contact.name} ({contact.type})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="legend">
        <div className="legend-title">Legenda Compatibilità:</div>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-color compat-high"></span>
            <span>🟢 Alta (5)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color compat-medium-high"></span>
            <span>🔵 Media-Alta (4)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color compat-medium"></span>
            <span>🟡 Media (3)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color compat-low"></span>
            <span>🔴 Bassa (2)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color compat-very-low"></span>
            <span>⚫ Molto Bassa (1)</span>
          </div>
        </div>
      </div>

      {viewMode === 'matrix' ? (
        <div className="matrix-container">
          {/* FIX: Grid senza wrapper .matrix-row, tutte le celle sono figli diretti */}
          <div className="matrix-grid" data-cols={sortedContacts.length}>
            {/* Cella angolo in alto a sinistra */}
            <div className="matrix-header-cell corner"></div>

            {/* Intestazione colonne */}
            {sortedContacts.map(contact => (
              <div key={`header-${contact.id}`} className="matrix-header-cell">
                <div className="contact-header">
                  <div className="contact-name">{contact.name}</div>
                  <div className="contact-type">{contact.type}</div>
                </div>
              </div>
            ))}

            {/* Celle della matrice - TUTTE figli diretti del grid */}
            {filteredContacts.map(rowContact => {
              // Prima cella di ogni riga: nome del contatto
              return [
                <div key={`row-header-${rowContact.id}`} className="matrix-row-header">
                  <div className="contact-header">
                    <div className="contact-name">{rowContact.name}</div>
                    <div className="contact-type">{rowContact.type}</div>
                  </div>
                </div>,

                // Poi tutte le celle della riga
                ...sortedContacts.map(colContact => {
                  // Diagonale (stesso contatto)
                  if (rowContact.id === colContact.id) {
                    return (
                      <div key={`diag-${rowContact.id}-${colContact.id}`} className="matrix-cell diagonal">
                        <span className="diagonal-text">—</span>
                      </div>
                    );
                  }

                  // Relazione tra due contatti diversi
                  const relationship = getRelationship(rowContact.id, colContact.id);
                  if (!relationship) {
                    return (
                      <div key={`empty-${rowContact.id}-${colContact.id}`} className="matrix-cell empty">
                        <span style={{ fontSize: '0.7rem', color: '#ccc' }}>N/A</span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={`rel-${rowContact.id}-${colContact.id}`}
                      className={`matrix-cell ${getColorClass(relationship.compatibility)}`}
                      title={`${relationship.contact1.name} ↔ ${relationship.contact2.name}
Relazione: ${relationship.relationship}
${relationship.description}
Compatibilità: ${relationship.compatibilityText}`}
                    >
                      <div className="relationship-cell">
                        <span className="relationship-emoji">{relationship.emoji}</span>
                        <span className="relationship-term">{relationship.description}</span>
                        <div className="compatibility-badge">
                          {relationship.compatibility}/5
                        </div>
                      </div>
                    </div>
                  );
                })
              ];
            })}
          </div>
        </div>
      ) : (
        <div className="list-view">
          <div className="relationships-list">
            {matrixData.relationships
              .filter(rel => 
                !selectedContact || 
                rel.contact1.id === selectedContact || 
                rel.contact2.id === selectedContact
              )
              .sort((a, b) => b.compatibility - a.compatibility)
              .map((rel, index) => (
                <div key={index} className={`relationship-card ${getColorClass(rel.compatibility)}`}>
                  <div className="relationship-header">
                    <span className="relationship-emoji">{rel.emoji}</span>
                    <h4>{rel.relationship}</h4>
                    <span className="compatibility-score">{rel.compatibility}/5</span>
                  </div>
                  <div className="relationship-contacts">
                    <div className="contact-pair">
                      <div className="contact-info">
                        <div className="contact-name">{rel.contact1.name}</div>
                        <div className="contact-type">{rel.contact1.type}</div>
                      </div>
                      <div className="relationship-arrow">↔</div>
                      <div className="contact-info">
                        <div className="contact-name">{rel.contact2.name}</div>
                        <div className="contact-type">{rel.contact2.type}</div>
                      </div>
                    </div>
                  </div>
                  <div className="relationship-description">
                    <p>{rel.description}</p>
                    <div className="compatibility-label">
                      {rel.compatibilityText}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}