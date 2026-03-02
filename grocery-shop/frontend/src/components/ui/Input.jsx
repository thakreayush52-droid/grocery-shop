const Input = ({ 
  label, 
  error, 
  className = '', 
  ...props 
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-2 rounded-lg border 
          ${error 
            ? 'border-red-500 focus:ring-red-500' 
            : 'border-slate-300 dark:border-slate-600 focus:ring-green-500'
          }
          bg-white dark:bg-slate-800 
          text-slate-900 dark:text-slate-100 
          focus:outline-none focus:ring-2 focus:border-transparent 
          transition-all duration-200
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default Input;
