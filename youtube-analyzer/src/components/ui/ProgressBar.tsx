// ========== SECAO: COMPONENTE PROGRESS BAR ==========

interface ProgressBarProps {
  progress: number; // 0-100
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'success' | 'danger';
  className?: string;
}

const sizeStyles = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

const variantStyles = {
  primary: 'bg-primary-500',
  success: 'bg-green-500',
  danger: 'bg-red-500',
};

export function ProgressBar({
  progress,
  showLabel = false,
  size = 'md',
  variant = 'primary',
  className = '',
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full bg-dark-700 rounded-full overflow-hidden ${sizeStyles[size]}`}>
        <div
          className={`h-full transition-all duration-300 ease-out rounded-full ${variantStyles[variant]}`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-xs text-dark-400 text-right">
          {Math.round(clampedProgress)}%
        </div>
      )}
    </div>
  );
}
