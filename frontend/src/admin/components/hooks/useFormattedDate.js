import { useState, useEffect } from "react";

const useFormattedDate = (
  locale = "en-US",
  options = {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  },
) => {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return dateTime.toLocaleDateString(locale, options);
};

export default useFormattedDate;
