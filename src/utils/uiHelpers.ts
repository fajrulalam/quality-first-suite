// Get CSS class for passedIn field
export const getPassedInClass = (passedIn: string) => {
  switch (passedIn) {
    case "1st run":
      return "text-green-500";
    case "2nd run":
      return "text-blue-500";
    default:
      return "text-red-500";
  }
};