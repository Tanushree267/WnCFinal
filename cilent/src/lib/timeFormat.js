const timeForamt = (time) => {//  function to format time from minutes to hours and minutes
  const hours = Math.floor(time / 60);
  const minutes = time % 60;
 return `${hours}h ${minutes}m`;
}
export default timeForamt