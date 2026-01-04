# 🧠 Personality Classifier App

Applicazione web per classificare contatti secondo i 16 tipi di personalità MBTI attraverso 4 slider interattivi, con frontend React + Vite + TypeScript, backend Node.js + Express + TypeScript e database MariaDB.

## 📋 Indice

- [Caratteristiche Principali](#caratteristiche-principali)
- [Struttura del Progetto](#struttura-del-progetto)
- [Database Schema](#database-schema)
- [Prerequisiti](#prerequisiti)
- [Installazione](#installazione)
- [Configurazione](#configurazione)
- [Avvio Automatico (macOS)](#avvio-automatico-macos)
- [Utilizzo](#utilizzo)
- [API Endpoints](#api-endpoints)
- [Sistema di Valutazione MBTI](#sistema-di-valutazione-mbti)

## ✨ Caratteristiche Principali

- 🎚️ **4 Slider Interattivi** - Valuta ogni dimensione MBTI separatamente (E-I, S-N, T-F, J-P)
- 🧮 **Calcolo Automatico** - Il tipo MBTI viene calcolato automaticamente dalle scale
- 📊 **Statistiche per Relazione** - Visualizza distribuzione per tipo di relazione (famiglia, amici, colleghi)
- 🔗 **Sistema di Affinità** - Visualizza la compatibilità di ogni contatto con tutti gli altri
- 🧭 **Matrice delle Relazioni** - Visualizzazione completa di tutte le relazioni tra contatti (vista matrice e lista)
- 💾 **Persistenza Dati** - Database MariaDB per storage affidabile
- 🔄 **Hot Reload** - Sviluppo rapido con Vite
- 🎨 **Design Moderno** - Interfaccia responsive e intuitiva
- 🔒 **Type Safety** - TypeScript su frontend e backend

## 📁 Struttura del Progetto

```
personality-classifier/
├── .git/                           # Repository Git
├── .gitignore                      # File da ignorare in Git
├── README.md                       # Questo file
├── LICENSE                         # Licenza MIT
├── backend/                        # Backend Node.js + Express + TypeScript
│   ├── node_modules/              # Dipendenze backend
│   ├── dist/                      # File TypeScript compilati
│   ├── src/                       # Codice sorgente TypeScript
│   │   └── server.ts             # Server Express principale
│   ├── .env                       # Variabili d'ambiente (non in Git)
│   ├── tsconfig.json              # Configurazione TypeScript
│   └── package.json               # Dipendenze e script backend
└── frontend/                       # Frontend React + Vite + TypeScript
    ├── node_modules/              # Dipendenze frontend
    ├── public/                    # File statici
    ├── src/                       # Codice sorgente React + TypeScript
    │   ├── components/           # Componenti React
    │   │   ├── RelationshipMatrix.tsx  # Matrice relazioni
    │   │   └── RelationshipMatrix.css  # Stili matrice
    │   ├── App.tsx               # Componente principale
    │   ├── App.css               # Stili applicazione
    │   ├── types.ts              # Type definitions
    │   ├── main.tsx              # Entry point React
    │   └── index.css
    ├── index.html                 # HTML template
    ├── vite.config.ts             # Configurazione Vite
    ├── tsconfig.json              # Configurazione TypeScript
    └── package.json               # Dipendenze e script frontend
```

## 🗄️ Database Schema

### Tabella: `personality_types`

Contiene i 16 tipi di personalità MBTI.

| Campo       | Tipo         | Descrizione                    |
|-------------|--------------|--------------------------------|
| id          | INT          | Primary Key, Auto Increment    |
| code        | VARCHAR(4)   | Codice MBTI (es. INTJ, ENFP)  |
| name        | VARCHAR(50)  | Nome del tipo                  |
| description | TEXT         | Descrizione del tipo           |

**Esempio dati:**
```sql
+----+------+---------------+------------------------------------------+
| id | code | name          | description                              |
+----+------+---------------+------------------------------------------+
| 1  | INTJ | Architetto    | Pensatori strategici con un piano...    |
| 2  | INTP | Logico        | Inventori innovativi con una sete...    |
| 3  | ENTJ | Comandante    | Leader audaci, immaginativi...          |
+----+------+---------------+------------------------------------------+
```

### Tabella: `contacts`

Memorizza i contatti e le loro valutazioni MBTI.

| Campo                | Tipo         | Descrizione                              |
|---------------------|--------------|------------------------------------------|
| id                  | INT          | Primary Key, Auto Increment              |
| name                | VARCHAR(100) | Nome del contatto (obbligatorio)         |
| surname             | VARCHAR(100) | Cognome del contatto                     |
| relationship        | VARCHAR(50)  | Tipo di relazione (amico, collega, ecc.) |
| personality_type_id | INT          | Foreign Key → personality_types(id)      |
| notes               | TEXT         | Note personali                           |
| scale_ei            | INT          | Scala E-I: da -50 (E) a +50 (I)        |
| scale_sn            | INT          | Scala S-N: da -50 (S) a +50 (N)        |
| scale_tf            | INT          | Scala T-F: da -50 (T) a +50 (F)        |
| scale_jp            | INT          | Scala J-P: da -50 (J) a +50 (P)        |
| created_at          | TIMESTAMP    | Data di creazione                        |
| updated_at          | TIMESTAMP    | Data ultima modifica                     |

**Relazioni:**
- `contacts.personality_type_id` → `personality_types.id` (Foreign Key)

### Diagramma ER

```
┌─────────────────────┐         ┌──────────────────────┐
│ personality_types   │         │ contacts             │
├─────────────────────┤         ├──────────────────────┤
│ PK id               │◄────────│ PK id                │
│    code (UNIQUE)    │    1:N  │    name              │
│    name             │         │    surname           │
│    description      │         │    relationship      │
└─────────────────────┘         │ FK personality_type_id│
                                │    notes             │
                                │    scale_ei          │
                                │    scale_sn          │
                                │    scale_tf          │
                                │    scale_jp          │
                                │    created_at        │
                                │    updated_at        │
                                └──────────────────────┘
```

## ⚙️ Prerequisiti

- **macOS** (per l'avvio automatico)
- **Node.js** >= 18.x
- **npm** >= 9.x
- **TypeScript** >= 5.x
- **MariaDB** >= 10.x (o MySQL)
- **Homebrew** (gestore pacchetti macOS)

## 🚀 Installazione

### 1. Installa i prerequisiti

```bash
# Installa Homebrew (se non presente)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Installa Node.js
brew install node

# Installa MariaDB
brew install mariadb

# Avvia MariaDB
brew services start mariadb

# Configura MariaDB (imposta password root)
mysql_secure_installation
```

### 2. Configura il Database

```bash
# Accedi a MariaDB
mysql -u root -p

# Esegui i seguenti comandi SQL
```

```sql
-- Crea il database
CREATE DATABASE personality_app;
USE personality_app;

-- Crea tabella personality_types
CREATE TABLE personality_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(4) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    description TEXT
);

-- Crea tabella contacts con le scale MBTI
CREATE TABLE contacts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100),
    relationship VARCHAR(50),
    personality_type_id INT,
    notes TEXT,
    scale_ei INT DEFAULT 0 COMMENT 'Scale E-I: -50 (E) a +50 (I)',
    scale_sn INT DEFAULT 0 COMMENT 'Scale S-N: -50 (S) a +50 (N)',
    scale_tf INT DEFAULT 0 COMMENT 'Scale T-F: -50 (T) a +50 (F)',
    scale_jp INT DEFAULT 0 COMMENT 'Scale J-P: -50 (J) a +50 (P)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (personality_type_id) REFERENCES personality_types(id),
    CONSTRAINT chk_scale_ei CHECK (scale_ei >= -50 AND scale_ei <= 50),
    CONSTRAINT chk_scale_sn CHECK (scale_sn >= -50 AND scale_sn <= 50),
    CONSTRAINT chk_scale_tf CHECK (scale_tf >= -50 AND scale_tf <= 50),
    CONSTRAINT chk_scale_jp CHECK (scale_jp >= -50 AND scale_jp <= 50)
);

-- Tabelle per il sistema di relazioni MBTI
CREATE TABLE mbti_relationship_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    term VARCHAR(50) NOT NULL UNIQUE,
    color_code CHAR(1) NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    description TEXT NOT NULL,
    compatibility_level INT NOT NULL,
    CHECK (compatibility_level BETWEEN 1 AND 5)
);

CREATE TABLE mbti_relationships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type_a VARCHAR(4) NOT NULL,
    type_b VARCHAR(4) NOT NULL,
    relationship_term VARCHAR(50) NOT NULL,
    color_code CHAR(1) NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    compatibility_level INT NOT NULL,
    notes TEXT,
    FOREIGN KEY (type_a) REFERENCES personality_types(code),
    FOREIGN KEY (type_b) REFERENCES personality_types(code),
    FOREIGN KEY (relationship_term) REFERENCES mbti_relationship_types(term),
    UNIQUE KEY uk_types (type_a, type_b)
);

-- Inserisci i 16 tipi MBTI
INSERT INTO personality_types (code, name, description) VALUES
('INTJ', 'Architetto', 'Pensatori strategici con un piano per tutto'),
('INTP', 'Logico', 'Inventori innovativi con una sete insaziabile di conoscenza'),
('ENTJ', 'Comandante', 'Leader audaci, immaginativi e volitivi'),
('ENTP', 'Dibattitore', 'Pensatori intelligenti e curiosi'),
('INFJ', 'Avvocato', 'Idealisti tranquilli e mistici'),
('INFP', 'Mediatore', 'Persone poetiche, gentili e altruiste'),
('ENFJ', 'Protagonista', 'Leader carismatici e ispiratori'),
('ENFP', 'Attivista', 'Spiriti liberi entusiasti, creativi e socievoli'),
('ISTJ', 'Logista', 'Individui pratici e concreti'),
('ISFJ', 'Difensore', 'Protettori dedicati e calorosi'),
('ESTJ', 'Esecutivo', 'Eccellenti amministratori'),
('ESFJ', 'Console', 'Persone estremamente premurose, socievoli e popolari'),
('ISTP', 'Virtuoso', 'Sperimentatori audaci e pratici'),
('ISFP', 'Avventuriero', 'Artisti flessibili e affascinanti'),
('ESTP', 'Imprenditore', 'Persone intelligenti, energiche e percettive'),
('ESFP', 'Intrattenitore', 'Entertainer spontanei, energici e entusiasti');

-- Inserisci i termini delle relazioni (24 tipi)
INSERT INTO mbti_relationship_types (term, color_code, emoji, description, compatibility_level) VALUES
('Gemello', 'V', '🟢', 'Stesso tipo MBTI. Massima comprensione immediata.', 5),
('Fratello', 'V', '🟢', 'Gruppo cognitivo comune. Forte affinità naturale.', 5),
('Alleato', 'V', '🟢', 'Funzioni cognitive che si supportano. Buon equilibrio.', 4),
('Simili', 'B', '🔵', 'Condividono 3 lettere su 4. Visione affine.', 4),
('Affini', 'B', '🔵', 'Stesso temperamento. Valori e priorità simili.', 4),
('Complementari', 'B', '🔵', 'Funzioni opposte che si bilanciano idealmente.', 4),
('Rispetto', 'B', '🔵', 'Ammirano le differenze. Richiede impegno.', 3),
('Empatici', 'B', '🔵', 'Si incontrano sulla funzione Feeling.', 3),
('Logici', 'B', '🔵', 'Si incontrano sulla funzione Thinking.', 3),
('Strategici', 'B', '🔵', 'Visione a lungo termine simile (NJ).', 3),
('Pragmatici', 'B', '🔵', 'Atteggiamento verso fatti concreti (ST).', 3),
('Stimolanti', 'G', '🟡', 'Si provocano intellettualmente. Crescita e frustrazione.', 3),
('Cognitivi', 'G', '🟡', 'Stesse funzioni in ordine diverso.', 3),
('Energici', 'G', '🟡', 'Condividono energia ma decisioni opposte.', 2),
('Strutturati', 'G', '🟡', 'Atteggiamento simile verso pianificazione (J).', 2),
('Efficaci', 'G', '🟡', 'Collaborano per obiettivi comuni.', 2),
('Diversi', 'R', '🔴', 'Poche funzioni in comune. Richiede sforzo.', 2),
('Distanti', 'R', '🔴', 'Mondi percettivi lontani.', 2),
('Sfidante', 'R', '🔴', 'Differenze stimolanti ma frustranti.', 2),
('Polo opposto', 'R', '🔴', 'Differiscono su 3 lettere.', 2),
('Mondi diversi', 'R', '🔴', 'Visioni radicalmente differenti.', 1),
('Tesi', 'R', '🔴', 'Differenze strutturali che creano attrito.', 1),
('Opposti', 'N', '⚫', 'Opposti su tutte 4 lettere. Massimo potenziale.', 1),
('Speculari', 'N', '⚫', 'Visione del mondo invertita.', 1);
```

**⚠️ IMPORTANTE**: Per popolare la matrice completa 16x16 (256 relazioni), scarica ed esegui il file SQL completo fornito separatamente.

### 3. Installa le dipendenze del progetto

```bash
# Clona o scarica il progetto
cd personality-classifier

# Installa dipendenze backend
cd backend
npm install

# Compila TypeScript
npm run build

# Installa dipendenze frontend
cd ../frontend
npm install
```

## 🔧 Configurazione

### File `.env` (Backend)

Crea il file `backend/.env` con le seguenti variabili:

```env
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tua_password_mariadb
DB_NAME=personality_app
```

### File `.gitignore` (Root del progetto)

```gitignore
# Dependencies
node_modules/
frontend/node_modules/
backend/node_modules/

# Environment variables
.env
backend/.env

# TypeScript
backend/dist/
*.tsbuildinfo

# Logs
*.log
npm-debug.log*
logs/
/tmp/

# Build
frontend/build/
frontend/dist/

# OS files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Testing
coverage/
.nyc_output/

# Source maps
*.map
```

## 🍎 Avvio Automatico (macOS)

Per far partire automaticamente il backend all'avvio del Mac, usa **launchd**.

### 1. Trova il percorso di Node.js

```bash
which node
# Output esempio: /usr/local/bin/node o /opt/homebrew/bin/node
```

### 2. Crea il file plist

```bash
nano ~/Library/LaunchAgents/com.personalityapp.backend.plist
```

### 3. Incolla questa configurazione

**⚠️ IMPORTANTE: Sostituisci i percorsi con i tuoi!**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.personalityapp.backend</string>
    
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>/Users/TUONOMEUTENTE/personality-classifier/backend/dist/server.js</string>
    </array>
    
    <key>RunAtLoad</key>
    <true/>
    
    <key>KeepAlive</key>
    <true/>
    
    <key>WorkingDirectory</key>
    <string>/Users/TUONOMEUTENTE/personality-classifier/backend</string>
    
    <key>StandardOutPath</key>
    <string>/tmp/personality-backend.log</string>
    
    <key>StandardErrorPath</key>
    <string>/tmp/personality-backend-error.log</string>
    
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
    </dict>
</dict>
</plist>
```

### 4. Carica il servizio

```bash
# Imposta i permessi corretti
chmod 644 ~/Library/LaunchAgents/com.personalityapp.backend.plist

# Compila il backend prima
cd backend
npm run build

# Carica il servizio
launchctl load ~/Library/LaunchAgents/com.personalityapp.backend.plist

# Verifica che sia attivo
launchctl list | grep personalityapp
```

### Comandi utili per launchd

```bash
# Fermare il servizio
launchctl unload ~/Library/LaunchAgents/com.personalityapp.backend.plist

# Riavviare il servizio
launchctl unload ~/Library/LaunchAgents/com.personalityapp.backend.plist
launchctl load ~/Library/LaunchAgents/com.personalityapp.backend.plist

# Vedere i log
tail -f /tmp/personality-backend.log
tail -f /tmp/personality-backend-error.log

# Rimuovere completamente il servizio
launchctl unload ~/Library/LaunchAgents/com.personalityapp.backend.plist
rm ~/Library/LaunchAgents/com.personalityapp.backend.plist
```

## 🎯 Utilizzo

### Avvio Manuale (sviluppo)

```bash
# Terminale 1 - Backend (TypeScript con hot reload)
cd backend
npm run dev
# Output: Server running on port 3001

# Oppure, usa la versione compilata
npm run build
npm start

# Terminale 2 - Frontend (Vite con hot reload)
cd frontend
npm run dev
# Output: ➜ Local: http://localhost:3000/
```

### Avvio con launchd (produzione)

Il backend parte automaticamente all'avvio del Mac. Per il frontend:

```bash
cd frontend
npm run dev
```

### Build per produzione

```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
# Crea la cartella dist/ con i file ottimizzati
```

## 🔌 API Endpoints

### Health Check
- **GET** `/api/health` - Verifica stato server

### Personality Types
- **GET** `/api/personality-types` - Lista tutti i tipi di personalità

### Contacts
- **GET** `/api/contacts` - Lista tutti i contatti con tipo calcolato
- **GET** `/api/contacts/:id` - Dettagli singolo contatto
- **GET** `/api/contacts/:id/affinities` - Affinità del contatto con tutti gli altri
- **GET** `/api/contacts/relationships` - Matrice completa delle relazioni tra tutti i contatti
- **POST** `/api/contacts` - Crea nuovo contatto
- **PUT** `/api/contacts/:id` - Aggiorna contatto
- **DELETE** `/api/contacts/:id` - Elimina contatto

### Statistics
- **GET** `/api/stats` - Statistiche per relazione

### MBTI Relationships
- **GET** `/api/mbti-relationships/:typeA/:typeB` - Relazione tra due tipi MBTI specifici

### Admin (solo sviluppo)
- **POST** `/api/admin/populate-relationships` - Popola tabelle relazioni
- **GET** `/api/admin/relationships-status` - Verifica stato tabelle

### Esempio richiesta POST

```bash
curl -X POST http://localhost:3001/api/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mario",
    "surname": "Rossi",
    "relationship": "amico",
    "scale_ei": -30,
    "scale_sn": 20,
    "scale_tf": -15,
    "scale_jp": 25,
    "notes": "Persona molto socievole e creativa"
  }'
```

**Response:**
```json
{
  "id": 1,
  "name": "Mario",
  "surname": "Rossi",
  "relationship": "amico",
  "personality_type_id": 7,
  "personality_code": "ENFP",
  "personality_name": "Attivista",
  "calculated_type": "ENTP",
  "scale_ei": -30,
  "scale_sn": 20,
  "scale_tf": -15,
  "scale_jp": 25,
  "notes": "Persona molto socievole e creativa",
  "created_at": "2025-01-20T10:30:00.000Z",
  "updated_at": "2025-01-20T10:30:00.000Z"
}
```

### Esempio GET affinità

```bash
curl http://localhost:3001/api/contacts/1/affinities
```

**Response:**
```json
[
  {
    "contact_id": 2,
    "name": "Laura",
    "surname": "Bianchi",
    "personality_type": "INFJ",
    "relationship_term": "Complementari",
    "emoji": "🔵",
    "color_code": "B",
    "compatibility_level": 4,
    "description": "Funzioni opposte che si bilanciano idealmente"
  },
  {
    "contact_id": 3,
    "name": "Paolo",
    "surname": "Verdi",
    "personality_type": "ISTJ",
    "relationship_term": "Sfidante",
    "emoji": "🔴",
    "color_code": "R",
    "compatibility_level": 2,
    "description": "Differenze stimolanti ma frustranti"
  }
]
```

### Esempio GET matrice relazioni

```bash
curl http://localhost:3001/api/contacts/relationships
```

**Response:**
```json
{
  "contacts": [
    {
      "id": 1,
      "name": "Mario Rossi",
      "type": "ENTP"
    },
    {
      "id": 2,
      "name": "Laura Bianchi",
      "type": "INFJ"
    }
  ],
  "relationships": [
    {
      "contact1": {
        "id": 1,
        "name": "Mario Rossi",
        "type": "ENTP"
      },
      "contact2": {
        "id": 2,
        "name": "Laura Bianchi",
        "type": "INFJ"
      },
      "relationship": "Complementari",
      "emoji": "🔵",
      "colorCode": "B",
      "compatibility": 4,
      "description": "Funzioni opposte che si bilanciano idealmente",
      "compatibilityText": "Alta compatibilità"
    }
  ],
  "compatibilityLevels": [
    { "level": 5, "label": "Alta", "color": "green" },
    { "level": 4, "label": "Media-Alta", "color": "blue" },
    { "level": 3, "label": "Media", "color": "yellow" },
    { "level": 2, "label": "Bassa", "color": "orange" },
    { "level": 1, "label": "Molto Bassa", "color": "red" }
  ]
}
```

## 🎚️ Sistema di Valutazione MBTI

### Le 4 Dimensioni

Ogni contatto viene valutato su 4 scale indipendenti, ciascuna da **-50** a **+50**:

#### 1. **Energia (E-I)**
```
-50 ←————— 0 ————→ +50
 E (Estroverso)    I (Introverso)
```

**Estroverso (E < 0):**
- Parla volentieri con sconosciuti
- Energico in gruppo
- Pensa parlando
- Cerca stimoli esterni

**Introverso (I > 0):**
- Ascolta più che parlare
- Riflette prima di rispondere
- Riservato o pensieroso
- Evita folle o rumore

#### 2. **Percezione (S-N)**
```
-50 ←————— 0 ————→ +50
 S (Sensoriale)    N (Intuitivo)
```

**Sensing (S < 0):**
- Parla di fatti e dettagli
- Esperienze dirette
- Presente e pratico
- "L'ho visto con i miei occhi"

**iNtuition (N > 0):**
- Parla di idee e schemi
- Usa metafore
- Futuro e teoria
- "C'è un pattern qui..."

#### 3. **Decisioni (T-F)**
```
-50 ←————— 0 ————→ +50
 T (Pensiero)      F (Sentimento)
```

**Thinking (T < 0):**
- Obiettivo e logico
- Focalizzato su efficienza
- "È la decisione più razionale"
- Critica diretta

**Feeling (F > 0):**
- Empatico e armonioso
- Impatto umano e valori
- "Come si sentiranno?"
- Critica attenuata

#### 4. **Stile di Vita (J-P)**
```
-50 ←————— 0 ————→ +50
 J (Giudicante)    P (Percettivo)
```

**Judging (J < 0):**
- Pianifica e organizza
- Ama scadenze e ordine
- "Facciamo un piano"
- Decisioni prese

**Perceiving (P > 0):**
- Adattabile e spontaneo
- Procrastina volentieri
- "Vediamo come va"
- Opzioni aperte

### Calcolo del Tipo MBTI

Il tipo viene calcolato automaticamente:

```typescript
const type = 
  (scale_ei < 0 ? 'E' : 'I') +
  (scale_sn < 0 ? 'S' : 'N') +
  (scale_tf < 0 ? 'T' : 'F') +
  (scale_jp < 0 ? 'J' : 'P');
```

**Esempio:**
- `scale_ei: -25` → **E** (Estroverso)
- `scale_sn: +15` → **N** (Intuitivo)
- `scale_tf: -40` → **T** (Pensiero)
- `scale_jp: +30` → **P** (Percettivo)
- **Risultato: ENTP**

## 📊 Statistiche

L'endpoint `/api/stats` restituisce statistiche aggregate per **relazione**:

```json
{
  "total": 5,
  "byRelationship": [
    {
      "relationship": "amico",
      "total_count": 3,
      "unique_types": 2,
      "types": "ENTP, ISTP"
    },
    {
      "relationship": "familiare",
      "total_count": 2,
      "unique_types": 1,
      "types": "ISTJ"
    }
  ]
}
```

## 🔗 Sistema di Affinità e Matrice delle Relazioni

### Pannello Affinità Singolo Contatto

Ogni contatto ha un pulsante **"🔗 Affinità"** che mostra:
- Tutte le relazioni con gli altri contatti
- Ordinamento per compatibilità (alta → bassa)
- Emoji e colori per identificare rapidamente il tipo di relazione
- Descrizioni dettagliate di ogni relazione

**Livelli di Compatibilità:**
- 🟢 **5**: Gemello, Fratello - Eccellente comprensione
- 🟢 **4**: Alleato, Simili, Affini - Molto buona
- 🔵 **3**: Complementari, Rispetto, Logici, Empatici - Buona
- 🟡 **2**: Stimolanti, Energici, Diversi - Media
- 🔴 **1**: Opposti, Speculari, Mondi diversi - Sfidante

### Matrice delle Relazioni

Componente dedicato che visualizza tutte le relazioni in due modalità:

#### 🔲 Vista Matrice
- Matrice 2D completa (stile tabella)
- Riga per ogni contatto, colonna per ogni altro contatto
- Colori e emoji per identificare immediatamente le relazioni
- Header fisso e scroll orizzontale/verticale
- Hover per dettagli completi

#### 📋 Vista Lista
- Card per ogni coppia di contatti
- Ordinamento per compatibilità
- Filtro per contatto specifico
- Visualizzazione dettagliata di nome, tipo e descrizione relazione

**Controlli:**
- Toggle vista Matrice/Lista
- Ordinamento per Nome o Tipo MBTI
- Filtro per contatto specifico
- Legenda compatibilità sempre visibile

## 🐛 Troubleshooting

### Il backend non parte

```bash
# Controlla i log
tail -f /tmp/personality-backend-error.log

# Verifica che MariaDB sia attivo
brew services list

# Testa la connessione al database
mysql -u root -p -e "USE personality_app; SELECT COUNT(*) FROM contacts;"
```

### Errore 404 su `/api/contacts/relationships`

**Causa:** Ordine errato delle route in Express

**Soluzione:** Assicurati che `/api/contacts/relationships` sia definita **PRIMA** di `/api/contacts/:id` nel server.ts

### Matrice relazioni vuota o errore

```bash
# Verifica che le tabelle siano popolate
mysql -u root -p personality_app

# Conta relazioni (dovrebbero essere 256)
SELECT COUNT(*) FROM mbti_relationships;

# Se 0, esegui lo script di popolamento
SOURCE database_relationships_complete.sql;
```

### Colonna sinistra della matrice orizzontale

**Causa:** Struttura grid CSS errata

**Soluzione:** Assicurati che:
1. `RelationshipMatrix.css` usi `data-cols` attribute
2. Tutte le celle siano figli diretti del grid (nessun wrapper `.matrix-row`)
3. CSS abbia le regole `grid-template-columns` corrette

### Errori di compilazione TypeScript

```bash
# Backend
cd backend
npm run build

# Se ci sono errori, controlla tsconfig.json
# Verifica che tutti i tipi siano corretti
```

### Errori frontend

```bash
# Pulisci e reinstalla
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Permission denied su launchd

```bash
chmod 644 ~/Library/LaunchAgents/com.personalityapp.backend.plist
```

### Affinità non visualizzate

**Causa:** Contatti senza tipo MBTI o tabelle relazioni vuote

**Soluzione:**
```sql
-- Verifica contatti con tipo
SELECT c.id, c.name, pt.code 
FROM contacts c 
LEFT JOIN personality_types pt ON c.personality_type_id = pt.id;

-- Verifica popolamento relazioni
SELECT COUNT(*) FROM mbti_relationship_types;
SELECT COUNT(*) FROM mbti_relationships;
```

## 📦 Script npm disponibili

### Backend
```bash
npm run dev        # Sviluppo con ts-node e nodemon
npm run build      # Compila TypeScript
npm start          # Esegue versione compilata
npm run clean      # Rimuove dist/
npm run rebuild    # Clean + Build
```

### Frontend
```bash
npm run dev        # Sviluppo con hot reload
npm run build      # Build per produzione
npm run preview    # Preview della build
npm run type-check # Controlla errori TypeScript
npm run lint       # ESLint
```

## 📝 Note

- Il backend usa TypeScript compilato in JavaScript ES modules
- Il frontend usa Vite per build velocissime
- Le scale MBTI hanno constraint nel database (-50 a +50)
- Il tipo MBTI viene calcolato automaticamente sia nel backend che nel frontend
- Le statistiche mostrano la distribuzione per tipo di relazione
- I log del backend sono in `/tmp/` e vengono sovrascritti a ogni riavvio

## 📄 Licenza

Questo progetto è rilasciato sotto licenza MIT. Vedi il file [LICENSE](LICENSE) per i dettagli.

## 🤝 Contribuire

Questo è un progetto personale, ma se hai suggerimenti:
1. Fai un fork del repository
2. Crea un branch per la tua feature (`git checkout -b feature/AmazingFeature`)
3. Commit le modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 🚀 Funzionalità Future

- [ ] Export dati in CSV/Excel
- [ ] Grafici di rete delle relazioni
- [ ] Suggerimenti composizione gruppi ottimali
- [ ] Notifiche per nuove affinità
- [ ] Analisi dinamiche di gruppo
- [ ] Report PDF delle relazioni
- [ ] Storico modifiche dei contatti
- [ ] Backup automatico database
- [ ] Ricerca full-text nei contatti
- [ ] Tag personalizzati per contatti

## 📞 Supporto

Per problemi o domande:
- Controlla la sezione [Troubleshooting](#troubleshooting)
- Consulta la guida [GUIDA_IMPLEMENTAZIONE_SLIDER.md](GUIDA_IMPLEMENTAZIONE_SLIDER.md)
- Consulta la guida [GUIDA_AFFINITA_MBTI.md](GUIDA_AFFINITA_MBTI.md)
- Apri una issue su GitHub

---


*Versione 2.0.0 - TypeScript Edition con Sistema Completo di Relazioni*