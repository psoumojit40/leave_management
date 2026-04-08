/**
 * Calculates the number of working days between two dates
 * Excludes weekends (Saturday & Sunday)
 */
export const calculateWorkingDays = (startDate: Date, endDate: Date): number => {
  let count = 0;
  const curDate = new Date(startDate);
  const finishDate = new Date(endDate);

  // Loop through every day from start to end
  while (curDate <= finishDate) {
    const dayOfWeek = curDate.getDay();
    
    // 0 = Sunday, 6 = Saturday
    // Only count if it's Monday(1) through Friday(5)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    
    // Move to the next day
    curDate.setDate(curDate.getDate() + 1);
  }
  
  return count;
};

// export const calculateWorkingDays = (startDate: Date, endDate: Date): number => {
//   let count = 0;
//   const curDate = new Date(startDate);
//   const finishDate = new Date(endDate);

//   while (curDate <= finishDate) {
//     const dayOfWeek = curDate.getDay();
//     // 0 = Sunday, 6 = Saturday. Only count 1-5 (Mon-Fri)
//     if (dayOfWeek !== 0 && dayOfWeek !== 6) {
//       count++;
//     }
//     curDate.setDate(curDate.getDate() + 1);
//   }
//   return count;
// };