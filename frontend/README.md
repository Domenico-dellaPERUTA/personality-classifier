# 🧠 Personality Classifier App

Applicazione web per classificare contatti secondo i 16 tipi di personalità MBTI, con frontend React, backend Node.js e database MariaDB.

## 📋 Indice

- [Struttura del Progetto](#struttura-del-progetto)
- [Database Schema](#database-schema)
- [Prerequisiti](#prerequisiti)
- [Installazione](#installazione)
- [Configurazione](#configurazione)
- [Avvio Automatico (macOS)](#avvio-automatico-macos)
- [Utilizzo](#utilizzo)
- [API Endpoints](#api-endpoints)

## 📁 Struttura del Progetto

```
personality-classifier/
├── .git/                           # Repository Git
├── .gitignore                      # File da ignorare in Git
├── README.md                       # Questo file
├── backend/                        # Backend Node.js + Express
│   ├── node_modules/              # Dipendenze backend
│   ├── .env                       # Variabili d'ambiente (non in Git)
│   ├── server.js                  # Server Express principale
│   └── package.json               # Dipendenze e script backend
└── frontend/                       # Frontend React
    ├── node_modules/              # Dipendenze frontend
    ├── public/                    # File statici
    │   ├── index.html
    │   └── favicon.ico
    ├── src/                       # Codice sorgente React
    │   ├── App.js                # Componente principale
    │   ├── App.css               # Stili applicazione
    │   ├── index.js              # Entry point React
    │   └── index.css
    ├── package.json               # Dipendenze e script frontend
    └── package-lock.json
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

Memorizza i contatti e le loro classificazioni.

| Campo                | Tipo         | Descrizione                              |
|---------------------|--------------|------------------------------------------|
| id                  | INT          | Primary Key, Auto Increment              |
| name                | VARCHAR(100) | Nome del contatto (obbligatorio)         |
| surname             | VARCHAR(100) | Cognome del contatto                     |
| relationship        | VARCHAR(50)  | Tipo di relazione (amico, collega, ecc.) |
| personality_type_id | INT          | Foreign Key → personality_types(id)      |
| notes               | TEXT         | Note personali                           |
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
                                │    created_at        │
                                │    updated_at        │
                                └──────────────────────┘
```

## ⚙️ Prerequisiti

- **macOS** (per l'avvio automatico)
- **Node.js** >= 14.x
- **npm** >= 6.x
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

-- Crea tabella contacts
CREATE TABLE contacts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100),
    relationship VARCHAR(50),
    personality_type_id INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (personality_type_id) REFERENCES personality_types(id)
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
```

### 3. Installa le dipendenze del progetto

```bash
# Clona o scarica il progetto
cd personality-classifier

# Installa dipendenze backend
cd backend
npm install

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

**⚠️ IMPORTANTE: Sostituisci `/PATH/TO/NODE` e `/PATH/TO/PROJECT` con i tuoi percorsi reali!**

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
        <string>/Users/TUONOMEUTENTE/personality-classifier/backend/server.js</string>
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
# Terminale 1 - Backend
cd backend
node server.js
# Output: Server running on port 3001

# Terminale 2 - Frontend
cd frontend
npm start
# Si apre automaticamente http://localhost:3000
```

### Avvio con launchd (produzione)

Il backend parte automaticamente all'avvio del Mac. Per il frontend:

```bash
cd frontend
npm start
```

### Build per produzione (frontend)

```bash
cd frontend
npm run build
# Crea la cartella build/ con i file ottimizzati
```

## 🔌 API Endpoints

### Health Check
- **GET** `/api/health` - Verifica stato server

### Personality Types
- **GET** `/api/personality-types` - Lista tutti i tipi di personalità

### Contacts
- **GET** `/api/contacts` - Lista tutti i contatti
- **GET** `/api/contacts/:id` - Dettagli singolo contatto
- **POST** `/api/contacts` - Crea nuovo contatto
- **PUT** `/api/contacts/:id` - Aggiorna contatto
- **DELETE** `/api/contacts/:id` - Elimina contatto

### Statistics
- **GET** `/api/stats` - Statistiche sui contatti per tipo

### Esempio richiesta POST

```bash
curl -X POST http://localhost:3001/api/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mario",
    "surname": "Rossi",
    "relationship": "amico",
    "personality_type_id": 1,
    "notes": "Persona molto strategica"
  }'
```

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

### Errori di connessione frontend-backend

- Verifica che il backend sia in esecuzione sulla porta 3001
- Controlla che non ci siano firewall che bloccano localhost
- Verifica che il file `.env` abbia le credenziali corrette

### Permission denied su launchd

```bash
chmod 644 ~/Library/LaunchAgents/com.personalityapp.backend.plist
```

## 📝 Note

- Il database usa `utf8mb4` come charset predefinito
- Le password non sono criptate nel database (da implementare se necessario)
- L'app è progettata per uso locale, non per produzione su internet
- I log del backend sono in `/tmp/` e vengono sovrascritti a ogni riavvio

## 📄 Licenza

Progetto personale - Uso libero

---

