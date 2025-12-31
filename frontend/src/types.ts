// frontend/src/types.ts

export interface PersonalityType {
  id: number;
  code: string;
  name: string;
  description: string | null;
}

export interface Contact {
  id: number;
  name: string;
  surname: string | null;
  relationship: string | null;
  personality_type_id: number | null;
  personality_code: string | null;
  personality_name: string | null;
  notes: string | null;
  // Nuovi campi per le scale
  scale_ei: number | null; // -50 (E) a +50 (I)
  scale_sn: number | null; // -50 (S) a +50 (N)
  scale_tf: number | null; // -50 (T) a +50 (F)
  scale_jp: number | null; // -50 (J) a +50 (P)
  created_at: string;
  updated_at: string;
}

export interface ContactFormData {
  name: string;
  surname: string;
  relationship: string;
  notes: string;
  scale_ei: number;
  scale_sn: number;
  scale_tf: number;
  scale_jp: number;
}

export interface Statistics {
  total: number;
  byRelationship: {
    relationship: string;
    total_count: number;
    unique_types: number;
    types: string | null;
  }[];
}

export interface MBTIDimension {
  code: string;
  name: string;
  negative: {
    letter: string;
    label: string;
    description: string;
    traits: string[];
  };
  positive: {
    letter: string;
    label: string;
    description: string;
    traits: string[];
  };
}

export const MBTI_DIMENSIONS: MBTIDimension[] = [
  {
    code: 'EI',
    name: 'Energia',
    negative: {
      letter: 'E',
      label: 'Estroverso',
      description: 'Si ricarica con gli altri',
      traits: [
        'Parla volentieri con sconosciuti',
        'Energico in gruppo',
        'Pensa parlando',
        'Cerca stimoli esterni'
      ]
    },
    positive: {
      letter: 'I',
      label: 'Introverso',
      description: 'Si ricarica in solitudine',
      traits: [
        'Ascolta più che parlare',
        'Riflette prima di rispondere',
        'Riservato o pensieroso',
        'Evita folle o rumore'
      ]
    }
  },
  {
    code: 'SN',
    name: 'Percezione',
    negative: {
      letter: 'S',
      label: 'Sensing (Sensoriale)',
      description: 'Focalizzato sul concreto',
      traits: [
        'Parla di fatti e dettagli',
        'Esperienze dirette',
        'Presente e pratico',
        '"L\'ho visto con i miei occhi"'
      ]
    },
    positive: {
      letter: 'N',
      label: 'iNtuition (Intuitivo)',
      description: 'Focalizzato sulle possibilità',
      traits: [
        'Parla di idee e schemi',
        'Usa metafore',
        'Futuro e teoria',
        '"C\'è un pattern qui..."'
      ]
    }
  },
  {
    code: 'TF',
    name: 'Decisioni',
    negative: {
      letter: 'T',
      label: 'Thinking (Pensiero)',
      description: 'Decisioni logiche e obiettive',
      traits: [
        'Obiettivo e logico',
        'Focalizzato su efficienza',
        '"È la decisione più razionale"',
        'Critica diretta'
      ]
    },
    positive: {
      letter: 'F',
      label: 'Feeling (Sentimento)',
      description: 'Decisioni empatiche',
      traits: [
        'Empatico e armonioso',
        'Impatto umano e valori',
        '"Come si sentiranno?"',
        'Critica attenuata'
      ]
    }
  },
  {
    code: 'JP',
    name: 'Stile di vita',
    negative: {
      letter: 'J',
      label: 'Judging (Giudicante)',
      description: 'Preferenza per struttura',
      traits: [
        'Pianifica e organizza',
        'Ama scadenze e ordine',
        '"Facciamo un piano"',
        'Decisioni prese'
      ]
    },
    positive: {
      letter: 'P',
      label: 'Perceiving (Percettivo)',
      description: 'Preferenza per flessibilità',
      traits: [
        'Adattabile e spontaneo',
        'Procrastina volentieri',
        '"Vediamo come va"',
        'Opzioni aperte'
      ]
    }
  }
];