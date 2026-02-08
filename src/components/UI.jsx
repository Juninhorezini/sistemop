import React from 'react'
import { AlertCircle, CheckCircle, InfoIcon, XCircle } from 'lucide-react'

export function Alert({ type = 'info', title, message, onClose }) {
  const bgColors = {
    info: 'bg-blue-50 border-blue-200',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    error: 'bg-red-50 border-red-200'
  }

  const textColors = {
    info: 'text-blue-800',
    success: 'text-green-800',
    warning: 'text-yellow-800',
    error: 'text-red-800'
  }

  const icons = {
    info: <InfoIcon className="w-5 h-5" />,
    success: <CheckCircle className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />
  }

  return (
    <div className={`${bgColors[type]} border rounded-lg p-4 flex items-start gap-3`}>
      <div className={textColors[type]}>{icons[type]}</div>
      <div className="flex-1">
        {title && <h3 className={`font-bold ${textColors[type]}`}>{title}</h3>}
        {message && <p className={textColors[type]}>{message}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`${textColors[type]} hover:opacity-70`}
        >
          ✕
        </button>
      )}
    </div>
  )
}

export function Modal({ isOpen, title, message, onConfirm, onCancel, isDanger = false }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-white ${
              isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

export function Button({ children, onClick, type = 'button', variant = 'primary', size = 'md', disabled = false, loading = false, className = '' }) {
  const baseStyles = 'font-medium rounded-lg transition-colors flex items-center gap-2'

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400',
    success: 'bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400',
    ghost: 'bg-transparent text-gray-800 hover:bg-gray-100 border border-gray-300'
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      {loading && <span className="inline-block animate-spin">⟳</span>}
      {children}
    </button>
  )
}

export function Input({ label, type = 'text', value, onChange, placeholder, error, required = false, disabled = false, className = '' }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'} ${className}`}
      />
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  )
}

export function Select({ label, options, value, onChange, error, required = false, disabled = false, searchable = false, className = '' }) {
  const [search, setSearch] = React.useState('')
  const [isOpen, setIsOpen] = React.useState(false)

  const filteredOptions = searchable
    ? options.filter(opt =>
        opt.label.toLowerCase().includes(search.toLowerCase())
      )
    : options

  return (
    <div className="flex flex-col gap-1 relative">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {searchable ? (
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setTimeout(() => setIsOpen(false), 200)}
            className={`px-3 py-2 border rounded-lg w-full ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {isOpen && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto z-10">
              {filteredOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value)
                    setSearch(opt.label)
                    setIsOpen(false)
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'} ${className}`}
        >
          <option value="">Selecionar...</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  )
}

export function Table({ columns, data, loading = false, className = '' }) {
  if (loading) {
    return <div className="text-center py-8">Carregando...</div>
  }

  if (data.length === 0) {
    return <div className="text-center py-8 text-gray-500">Nenhum dado encontrado</div>
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse">
        <thead className="bg-gray-100">
          <tr>
            {columns.map(col => (
              <th key={col.key} className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 border-b`}>
              {columns.map(col => (
                <td key={col.key} className="px-4 py-3 text-sm">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Card({ children, title, className = '' }) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {title && <h3 className="text-lg font-bold mb-4">{title}</h3>}
      {children}
    </div>
  )
}

export function Badge({ text, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    gray: 'bg-gray-100 text-gray-800'
  }

  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[color]}`}>
      {text}
    </span>
  )
}
