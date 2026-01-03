// frontend/src/App.tsx
import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react'
import axios, { AxiosError } from 'axios'
import './App.css'
import { type Contact, type ContactFormData, type Statistics, MBTI_DIMENSIONS } from './types'
import RelationshipMatrix from './components/RelationshipMatrix';

const API_URL = '/api'

interface ErrorResponse {
  error: string
}

// Funzione per calcolare il tipo MBTI dalle scale
const calculateMBTI = (ei: number, sn: number, tf: number, jp: number): string => {
  return (
    (ei < 0 ? 'E' : 'I') +
    (sn < 0 ? 'S' : 'N') +
    (tf < 0 ? 'T' : 'F') +
    (jp < 0 ? 'J' : 'P')
  )
}

function App() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [stats, setStats] = useState<Statistics>({ total: 0, byRelationship: [] })
  const [showForm, setShowForm] = useState<boolean>(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    surname: '',
    relationship: '',
    notes: '',
    scale_ei: 0,
    scale_sn: 0,
    scale_tf: 0,
    scale_jp: 0
  })
  const [filter, setFilter] = useState<string>('')

  useEffect(() => {
    fetchContacts()
    fetchStats()
  }, [])

  const fetchContacts = async (): Promise<void> => {
    try {
      const response = await axios.get<Contact[]>(`${API_URL}/contacts`)
      setContacts(response.data)
    } catch (error) {
      console.error('Error fetching contacts:', error)
    }
  }

  const fetchStats = async (): Promise<void> => {
    try {
      const response = await axios.get<Statistics>(`${API_URL}/stats`)
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    try {
      if (editingContact) {
        await axios.put(`${API_URL}/contacts/${editingContact.id}`, formData)
      } else {
        await axios.post(`${API_URL}/contacts`, formData)
      }
      resetForm()
      fetchContacts()
      fetchStats()
    } catch (error) {
      console.error('Error saving contact:', error)
      const axiosError = error as AxiosError<ErrorResponse>
      alert(axiosError.response?.data?.error || 'Errore nel salvare il contatto')
    }
  }

  const handleDelete = async (id: number): Promise<void> => {
    if (window.confirm('Sei sicuro di voler eliminare questo contatto?')) {
      try {
        await axios.delete(`${API_URL}/contacts/${id}`)
        fetchContacts()
        fetchStats()
      } catch (error) {
        console.error('Error deleting contact:', error)
      }
    }
  }

  const handleEdit = (contact: Contact): void => {
    setEditingContact(contact)
    setFormData({
      name: contact.name,
      surname: contact.surname || '',
      relationship: contact.relationship || '',
      notes: contact.notes || '',
      scale_ei: contact.scale_ei || 0,
      scale_sn: contact.scale_sn || 0,
      scale_tf: contact.scale_tf || 0,
      scale_jp: contact.scale_jp || 0
    })
    setShowForm(true)
  }

  const resetForm = (): void => {
    setFormData({
      name: '',
      surname: '',
      relationship: '',
      notes: '',
      scale_ei: 0,
      scale_sn: 0,
      scale_tf: 0,
      scale_jp: 0
    })
    setEditingContact(null)
    setShowForm(false)
  }

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSliderChange = (dimension: string, value: number): void => {
    setFormData(prev => ({ ...prev, [dimension]: value }))
  }

  const currentType = calculateMBTI(
    formData.scale_ei,
    formData.scale_sn,
    formData.scale_tf,
    formData.scale_jp
  )

  const filteredContacts = contacts.filter(contact => {
    if (!filter) return true
    const contactType =  contact.personality_code
    return contactType === filter
  })

  // Calcola tutti i tipi unici presenti
  const uniqueTypes = Array.from(new Set(
    contacts.map(c => c.personality_code).filter((t): t is string => t !== null && t !== '')
  )).sort()

  return (
    <div className="App">
      <header>
        <h1>🧠 Classificatore di Personalità MBTI</h1>
        <p>Valuta i tuoi contatti sulle 4 dimensioni della personalità</p>
      </header>

      <div className="container">
        <div className="stats-section">
          <h2>Statistiche per Relazione</h2>
          <div className="stats-grid">
            <div className="stat-card total">
              <h3>Totale Contatti</h3>
              <p className="stat-number">{stats.total}</p>
            </div>
            {stats.byRelationship.slice(0, 5).map(rel => (
              <div key={rel.relationship} className="stat-card">
                <h4>{rel.relationship}</h4>
                <p className="stat-count">{rel.total_count} persona/e</p>
                <p className="stat-types">{rel.unique_types} tipo/i</p>
                {rel.types && (
                  <p className="stat-types-list">{rel.types}</p>
                )}
              </div>
            ))}
          </div>
          {/* Aggiungi la matrice qui */}
          <div className="matrix-section">
            <RelationshipMatrix />
          </div>
        </div>

        <div className="controls">
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? '✕ Chiudi' : '+ Aggiungi Contatto'}
          </button>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">Tutti i tipi</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {showForm && (
          <div className="form-container">
            <h2>{editingContact ? 'Modifica Contatto' : 'Nuovo Contatto'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <input
                  type="text"
                  name="name"
                  placeholder="Nome *"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="text"
                  name="surname"
                  placeholder="Cognome"
                  value={formData.surname}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-row">
                <input
                  type="text"
                  name="relationship"
                  placeholder="Relazione (es. amico, collega)"
                  value={formData.relationship}
                  onChange={handleInputChange}
                />
              </div>

              <div className="mbti-result">
                <h3>Tipo MBTI calcolato: <span className="mbti-badge">{currentType}</span></h3>
                <p className="mbti-hint">Usa gli slider per valutare la personalità</p>
              </div>

              <div className="mbti-scales">
                {MBTI_DIMENSIONS.map((dimension) => {
                  const scaleKey = `scale_${dimension.code.toLowerCase()}` as keyof ContactFormData
                  const value = formData[scaleKey] as number

                  return (
                    <div key={dimension.code} className="mbti-dimension">
                      <div className="dimension-header">
                        <h4>{dimension.name}</h4>
                        <span className="dimension-value">
                          {value < 0 ? dimension.negative.letter : dimension.positive.letter}
                          {Math.abs(value)}
                        </span>
                      </div>

                      <div className="dimension-labels">
                        <div className="label-left">
                          <strong>{dimension.negative.letter} - {dimension.negative.label}</strong>
                          <p>{dimension.negative.description}</p>
                          <ul className="traits">
                            {dimension.negative.traits.slice(0, 2).map((trait, i) => (
                              <li key={i}>{trait}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="label-right">
                          <strong>{dimension.positive.letter} - {dimension.positive.label}</strong>
                          <p>{dimension.positive.description}</p>
                          <ul className="traits">
                            {dimension.positive.traits.slice(0, 2).map((trait, i) => (
                              <li key={i}>{trait}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="slider-container">
                        <input
                          type="range"
                          min="-50"
                          max="50"
                          value={value}
                          onChange={(e) => handleSliderChange(scaleKey, parseInt(e.target.value))}
                          className="mbti-slider"
                        />
                        <div className="slider-scale">
                          <span>{dimension.negative.letter}</span>
                          <span>Neutro</span>
                          <span>{dimension.positive.letter}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <textarea
                name="notes"
                placeholder="Note e osservazioni"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
              />

              <div className="form-buttons">
                <button type="submit" className="btn btn-primary">
                  {editingContact ? 'Aggiorna' : 'Salva'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Annulla
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="contacts-section">
          <h2>Contatti ({filteredContacts.length})</h2>
          <div className="contacts-grid">
            {filteredContacts.map(contact => {
              const mbtiType = contact.personality_code || 'N/A'
              return (
                <div key={contact.id} className="contact-card">
                  <div className="contact-header">
                    <h3>{contact.name} {contact.surname}</h3>
                    <span className="personality-badge">{mbtiType}</span>
                  </div>
                  {contact.relationship && (
                    <p className="relationship">{contact.relationship}</p>
                  )}
                  <div className="contact-scales">
                    <div className="scale-mini">
                      <span>E/I:</span>
                      <div className="scale-bar">
                        <div 
                          className="scale-fill" 
                          style={{ 
                            width: `${Math.abs((contact.scale_ei || 0) / 50 * 100)}%`,
                            marginLeft: (contact.scale_ei || 0) < 0 ? '0' : 'auto'
                          }}
                        />
                      </div>
                      <span>{contact.scale_ei || 0 < 0 ? 'E' : 'I'}{Math.abs(contact.scale_ei || 0)}</span>
                    </div>
                    <div className="scale-mini">
                      <span>S/N:</span>
                      <div className="scale-bar">
                        <div 
                          className="scale-fill" 
                          style={{ 
                            width: `${Math.abs((contact.scale_sn || 0) / 50 * 100)}%`,
                            marginLeft: (contact.scale_sn || 0) < 0 ? '0' : 'auto'
                          }}
                        />
                      </div>
                      <span>{contact.scale_sn || 0 < 0 ? 'S' : 'N'}{Math.abs(contact.scale_sn || 0)}</span>
                    </div>
                    <div className="scale-mini">
                      <span>T/F:</span>
                      <div className="scale-bar">
                        <div 
                          className="scale-fill" 
                          style={{ 
                            width: `${Math.abs((contact.scale_tf || 0) / 50 * 100)}%`,
                            marginLeft: (contact.scale_tf || 0) < 0 ? '0' : 'auto'
                          }}
                        />
                      </div>
                      <span>{contact.scale_tf || 0 < 0 ? 'T' : 'F'}{Math.abs(contact.scale_tf || 0)}</span>
                    </div>
                    <div className="scale-mini">
                      <span>J/P:</span>
                      <div className="scale-bar">
                        <div 
                          className="scale-fill" 
                          style={{ 
                            width: `${Math.abs((contact.scale_jp || 0) / 50 * 100)}%`,
                            marginLeft: (contact.scale_jp || 0) < 0 ? '0' : 'auto'
                          }}
                        />
                      </div>
                      <span>{contact.scale_jp || 0 < 0 ? 'J' : 'P'}{Math.abs(contact.scale_jp || 0)}</span>
                    </div>
                  </div>
                  {contact.notes && (
                    <p className="notes">{contact.notes}</p>
                  )}
                  <div className="contact-actions">
                    <button onClick={() => handleEdit(contact)} className="btn-icon">
                      ✏️ Modifica
                    </button>
                    <button onClick={() => handleDelete(contact.id)} className="btn-icon delete">
                      🗑️ Elimina
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          {filteredContacts.length === 0 && (
            <p className="empty-state">Nessun contatto trovato. Aggiungi il primo!</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default App