export const AuthCard: React.FC<{children: React.ReactNode} > = ({children}) => {
    return(
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
            {children}
        </div>
    )
}