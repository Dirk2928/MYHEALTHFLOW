'use client'

import { useState, useRef } from 'react'

type Props = {
  onClose: () => void
  onSuccess: () => void
}

export default function ImportModal({ onClose, onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      const ext = selected.name.split('.').pop()?.toLowerCase()
      if (ext !== 'csv' && ext !== 'xlsx' && ext !== 'xls') {
        setError('Please upload a CSV or XLSX file')
        return
      }
      setFile(selected)
      setError('')
      setResult(null)
    }
  }

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file')
      return
    }

    setLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/patients/import', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (res.ok) {
        setResult(data)
        onSuccess()
      } else {
        setError(data.error || 'Import failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const headers = 'name,dob,barangayId,address,contactNo,emergencyContact'
    const example = 'Juan Dela Cruz,2000-01-15,STU-001,123 Main St,09123456789,09987654321'
    const csv = headers + '\n' + example
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'patient_import_template.csv'
    a.click()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Import Patients</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>

        {!result ? (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Upload a CSV or XLSX file. The file must have columns: <strong>name</strong>, <strong>dob</strong>, <strong>barangayId</strong>
            </p>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
              {file ? (
                <div>
                  <p className="text-sm font-medium text-gray-700">{file.name}</p>
                  <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                  <button
                    onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                    className="text-xs text-red-500 mt-1 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Click to select file
                </button>
              )}
            </div>

            <button
              onClick={downloadTemplate}
              className="text-xs text-gray-500 hover:text-gray-700 underline mb-4 block"
            >
              Download CSV template
            </button>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleImport}
                disabled={!file || loading}
                className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Importing...' : 'Import'}
              </button>
              <button
                onClick={onClose}
                className="text-sm text-gray-600 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-green-800">Import Complete</p>
              <div className="mt-2 space-y-1 text-sm text-green-700">
                <p>Total rows: {result.total}</p>
                <p>Imported: {result.imported}</p>
                <p>Skipped: {result.skipped}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          </>
        )}
      </div>
    </div>
  )
}