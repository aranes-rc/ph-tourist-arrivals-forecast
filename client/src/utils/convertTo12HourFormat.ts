export const convertTo12HourFormat = (time: any) => {
    const [hour] = time.split(':').map(Number);
    const period = hour >= 12 ? 'pm' : 'am';
    const formattedHour = hour === 0 || hour === 12 ? 12 : hour % 12;
    return `${formattedHour}${period}`;
};

export const formatTimeTo12Hour = (datetime: string) => {
    const [hour, minute] = datetime.split(' ')[1].split(':').map(Number);
    const period = hour >= 12 ? 'pm' : 'am';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minute < 10 ? '0' : ''}${minute} ${period}`;
};

