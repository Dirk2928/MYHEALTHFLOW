export type Medication = {
  key: string
  label: string
  category: 'medicine' | 'advice' | 'referral'
}

export type MedicationSuggestion = {
  symptomKey: string
  medications: Medication[]
}

export const MEDICATION_SUGGESTIONS: MedicationSuggestion[] = [
  {
    symptomKey: 'dizziness',
    medications: [
      { key: 'betahistine', label: 'Betahistine 16mg', category: 'medicine' },
      { key: 'rest', label: 'Bed rest advised', category: 'advice' },
      { key: 'hydration', label: 'Increase fluid intake', category: 'advice' },
      { key: 'bp_monitoring', label: 'Monitor blood pressure daily', category: 'advice' },
    ],
  },
  {
    symptomKey: 'fever',
    medications: [
      { key: 'paracetamol', label: 'Paracetamol 500mg', category: 'medicine' },
      { key: 'hydration', label: 'Increase fluid intake', category: 'advice' },
      { key: 'cold_compress', label: 'Cold compress', category: 'advice' },
      { key: 'rest', label: 'Bed rest advised', category: 'advice' },
    ],
  },
  {
    symptomKey: 'cough',
    medications: [
      { key: 'carbocisteine', label: 'Carbocisteine 500mg', category: 'medicine' },
      { key: 'warm_water', label: 'Drink warm water', category: 'advice' },
      { key: 'steam', label: 'Steam inhalation', category: 'advice' },
      { key: 'avoid_cold', label: 'Avoid cold drinks', category: 'advice' },
    ],
  },
  {
    symptomKey: 'headache',
    medications: [
      { key: 'paracetamol', label: 'Paracetamol 500mg', category: 'medicine' },
      { key: 'rest', label: 'Rest in quiet, dark room', category: 'advice' },
      { key: 'hydration', label: 'Increase fluid intake', category: 'advice' },
      { key: 'eye_check', label: 'Refer for eye checkup', category: 'referral' },
    ],
  },
  {
    symptomKey: 'fatigue',
    medications: [
      { key: 'multivitamins', label: 'Multivitamins', category: 'medicine' },
      { key: 'iron_supplement', label: 'Iron supplement', category: 'medicine' },
      { key: 'sleep_hygiene', label: 'Improve sleep hygiene', category: 'advice' },
      { key: 'balanced_diet', label: 'Balanced diet advice', category: 'advice' },
    ],
  },
]