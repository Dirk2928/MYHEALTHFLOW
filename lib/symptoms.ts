export type FollowUpQuestion = {
  key: string
  label: string
  type: 'text' | 'select' | 'number'
  options?: string[]
}

export type Symptom = {
  key: string
  label: string
  followUps: FollowUpQuestion[]
}

export const SYMPTOMS: Symptom[] = [
  {
    key: 'dizziness',
    label: 'Dizziness',
    followUps: [
      { key: 'duration', label: 'How long have you had dizziness?', type: 'select', options: ['Less than 1 day', '1–3 days', 'More than 3 days'] },
      { key: 'severity', label: 'Severity (1–10)', type: 'number' },
      { key: 'fainting', label: 'Any fainting episodes?', type: 'select', options: ['Yes', 'No'] },
      { key: 'bp_history', label: 'History of high blood pressure?', type: 'select', options: ['Yes', 'No', 'Unknown'] },
    ],
  },
  {
    key: 'fever',
    label: 'Fever',
    followUps: [
      { key: 'temperature', label: 'Temperature (°C)', type: 'number' },
      { key: 'duration', label: 'How long have you had fever?', type: 'select', options: ['Less than 1 day', '1–3 days', 'More than 3 days'] },
      { key: 'chills', label: 'Chills or shivering?', type: 'select', options: ['Yes', 'No'] },
    ],
  },
  {
    key: 'cough',
    label: 'Cough',
    followUps: [
      { key: 'type', label: 'Type of cough', type: 'select', options: ['Dry', 'With phlegm', 'With blood'] },
      { key: 'duration', label: 'How long have you had cough?', type: 'select', options: ['Less than 1 day', '1–3 days', 'More than 3 days'] },
    ],
  },
  {
    key: 'headache',
    label: 'Headache',
    followUps: [
      { key: 'location', label: 'Where is the headache?', type: 'select', options: ['Forehead', 'Temple', 'Back of head', 'Whole head'] },
      { key: 'severity', label: 'Severity (1–10)', type: 'number' },
      { key: 'nausea', label: 'Accompanied by nausea?', type: 'select', options: ['Yes', 'No'] },
    ],
  },
  {
    key: 'fatigue',
    label: 'Fatigue',
    followUps: [
      { key: 'duration', label: 'How long have you felt fatigued?', type: 'select', options: ['Less than 1 day', '1–3 days', 'More than 3 days'] },
      { key: 'sleep', label: 'Hours of sleep per night', type: 'number' },
    ],
  },
]