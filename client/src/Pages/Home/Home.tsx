import { useEffect, useState } from 'react';
import { Hero } from './Hero';
import { useForecastDataStore } from '../../store/useForecastDataStore';
import { Graph } from '../../Components/Graph';


export const Home = () => {

  const { currentForecastData, forecast } = useForecastDataStore();

  const [forecastMonths, setForecastMonths] = useState(12);
  
  useEffect(() => {
    const selectedDateInSession = localStorage.getItem('selectedDate');
    const date = selectedDateInSession !== null ? new Date(selectedDateInSession) : new Date('2025-05');

    forecast(date, forecastMonths);
  }, [forecast]);

  return (
    <section className='flex flex-col gap-5 pb-14'>
      <Hero />
      <Graph
        currentForecastData={currentForecastData}
        forecastMonths={forecastMonths}
        setForecastMonths={setForecastMonths}
      />
    </section>
  );
};
