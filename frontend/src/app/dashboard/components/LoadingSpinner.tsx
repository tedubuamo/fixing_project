interface LoadingSpinnerProps {
  fullScreen?: boolean;
}

export function LoadingSpinner({ fullScreen = false }: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center justify-center p-4 ${fullScreen ? 'min-h-screen' : 'h-full'}`}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
    </div>
  );
}