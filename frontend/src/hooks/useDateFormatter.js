import { useCallback } from 'react';

export const useDateFormatter = () => {
    const formatIncidentDate = useCallback((dateString) => {
        if (!dateString) return 'N/A';

        try {
            const date = new Date(dateString);

            if (isNaN(date.getTime())) {
                console.error('Invalid date:', dateString);
                return 'Invalid Date';
            }

            return date.toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric',
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'N/A';
        }
    }, []);

    return { formatIncidentDate };
};
