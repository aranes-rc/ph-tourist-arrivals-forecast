import { FC } from 'react';

interface ErrorProps {
    title?: string;
    message: string | null;
    onRetry?: () => void;
}

export const Error: FC<ErrorProps> = ({
    title = 'Something went wrong!',
    message = "The page you're looking for might have changed its name, or doesn't exist.",
    onRetry,
}) => {
    return (
        <div className="w-full max-w-2xl mx-auto px-6 py-20 text-center flex flex-col items-center">
            <h1 className="text-[4rem] font-extrabold text-red-500">Oops!</h1>
            <p className="text-2xl font-bold mb-2">{title}</p>
            <p className="text-gray-600">{message}</p>

            {onRetry && (
                <button
                    className="px-5 py-2 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition"
                    onClick={onRetry}
                >
                    Retry
                </button>
            )}
        </div>
    );
};
