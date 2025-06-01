import { useState, useEffect } from 'react';

export const useRandomProgressValues = (
  numValues: number,
  updateInterval: number,
  maxPerValue: number = 25,
  total: number = 100,
) => {
  const [values, setValues] = useState<number[]>(
    new Array(numValues).fill(0),
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      const newValues = values.map(() =>
        Math.floor(Math.random() * maxPerValue),
      );
      const currentTotal = newValues.reduce(
        (acc, val) => acc + val,
        0,
      );
      const remaining = total - currentTotal;

      if (remaining > 0) {
        newValues[
          Math.floor(Math.random() * newValues.length)
        ] += remaining;
      }

      setValues(newValues);
    }, updateInterval);

    return () => clearInterval(intervalId);
  }, [values, updateInterval, maxPerValue, total]);

  return values;
};
