import { useEffect, useState } from 'react';
import { Hero } from './Hero';
import { useForecastDataStore } from '../../store/useForecastDataStore';
import { Graph } from '../../Components/Graph';
import { useCountryForecastDataStore } from '../../store/useCountryForecastDataStore';


export const Home = () => {

  const forecastDataStore = useForecastDataStore();
  const countryForecastDataStore = useCountryForecastDataStore();

  const [forecastMonths, setForecastMonths] = useState(12);

  useEffect(() => {
    const selectedDateInSession = localStorage.getItem('selectedDate');
    const date = selectedDateInSession !== null ? new Date(selectedDateInSession) : new Date('2025-05');

    const forecastMonthsInSession = localStorage.getItem('forecastMonths');
    const monthsToUse = forecastMonthsInSession === null ? forecastMonths : Number(forecastMonthsInSession);
    if (forecastMonthsInSession) {
      setForecastMonths(monthsToUse)
    }

    forecastDataStore.forecast(date, monthsToUse);
    countryForecastDataStore.forecastTopCountries(date, monthsToUse);
  }, []);

  return (
    <section className='flex flex-col gap-5 pb-14'>
      <Hero />
      <Graph
        currentTopCountriesData={countryForecastDataStore.data}
        currentForecastData={forecastDataStore.data}
        forecastMonths={forecastMonths}
        setForecastMonths={setForecastMonths}
      />
    </section>
  );
};
