// frontend/src/App.tsx
import { useState, useEffect } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import axios, { AxiosError } from 'axios'
import './App.css'
import type { Contact, PersonalityType, ContactFormData, Statistics } from './types'

const API_URL = '/api' // Usa il proxy di Vite

interface ErrorResponse {
  error: string
}

function App() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [personalityTypes, setPersonalityTypes] = useState<PersonalityType[]>([])
  const [stats, setStats] = useState<Statistics>({ total: 0, byType: [] })
  const [showForm, setShowForm] = useState<boolean>(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    surname: '',
    relationship: '',
    personality_type_id: '',
    notes: ''
  })
  const [filter, setFilter] = useState<string>('')

  useEffect(() => {
    fetchContacts()
    fetchPersonalityTypes()
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

  const fetchPersonalityTypes = async (): Promise<void> => {
    try {
      const response = await axios.get<PersonalityType[]>(`${API_URL}/personality-types`)
      setPersonalityTypes(response.data)
    } catch (error) {
      console.error('Error fetching personality types:', error)
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
      const submitData = {
        ...formData,
        personality_type_id: formData.personality_type_id ? Number(formData.personality_type_id) : null
      }

      if (editingContact) {
        await axios.put(`${API_URL}/contacts/${editingContact.id}`, submitData)
      } else {
        await axios.post(`${API_URL}/contacts`, submitData)
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
      personality_type_id: contact.personality_type_id || '',
      notes: contact.notes || ''
    })
    setShowForm(true)
  }

  const resetForm = (): void => {
    setFormData({
      name: '',
      surname: '',
      relationship: '',
      personality_type_id: '',
      notes: ''
    })
    setEditingContact(null)
    setShowForm(false)
  }

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const filteredContacts = contacts.filter(contact => {
    if (!filter) return true
    return contact.personality_code === filter
  })

  return (
    <div className="App">
      <header>
        <h1>🧠 Classificatore di Personalità</h1>
        <p>Gestisci i tuoi contatti con i 16 tipi di personalità MBTI</p>
      </header>

      <div className="container">
        <div className="stats-section">
          <h2>Statistiche</h2>
          <div className="stats-grid">
            <div className="stat-card total">
              <h3>Totale Contatti</h3>
              <p className="stat-number">{stats.total}</p>
            </div>
            {stats.byType.slice(0, 5).map(type => (
              <div key={type.code} className="stat-card">
                <h4>{type.code}</h4>
                <p>{type.count} persona/e</p>
              </div>
            ))}
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
            {personalityTypes.map(type => (
              <option key={type.id} value={type.code}>
                {type.code} - {type.name}
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
                <select
                  name="personality_type_id"
                  value={formData.personality_type_id}
                  onChange={handleInputChange}
                >
                  <option value="">Seleziona tipo di personalità</option>
                  {personalityTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.code} - {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                name="notes"
                placeholder="Note"
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
            {filteredContacts.map(contact => (
              <div key={contact.id} className="contact-card">
                <div className="contact-header">
                  <h3>{contact.name} {contact.surname}</h3>
                  {contact.personality_code && (
                    <span className="personality-badge">
                      {contact.personality_code}
                    </span>
                  )}
                </div>
                {contact.relationship && (
                  <p className="relationship">{contact.relationship}</p>
                )}
                {contact.personality_name && (
                  <p className="personality-type">{contact.personality_name}</p>
                )}
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
            ))}
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