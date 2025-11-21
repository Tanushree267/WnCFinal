const isoTimeFormat = (dateTime) => { //seatlayout time format
    const date = new Date(dateTime);
    const LocalTime = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
    return LocalTime;
}
export default isoTimeFormat;