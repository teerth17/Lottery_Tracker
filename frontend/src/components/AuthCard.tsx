export const AuthCard: React.FC<{children: React.ReactNode}> = ({children}) => {
    return (
        <div className="max-w-md w-full bg-gray-50 dark:bg-gray-800 p-0 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            {/* Accent header bar */}
            <div className="h-2 w-full rounded-t-2xl bg-gradient-to-r from-blue-500 via-green-400 to-blue-400" />
            <div className="p-8">{children}</div>
        </div>
    );
};