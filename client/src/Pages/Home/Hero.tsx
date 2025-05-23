import { FaDatabase, FaRobot, FaCheck } from 'react-icons/fa';
import enterAnimate from "../../utils/enterAnimate";
import { motion } from "framer-motion";
import useRefInView from '../../hooks/useRefInView';
import { useDarkThemeMode } from '../../store/useDarkThemeMode';

export const Hero = () => {
    const [ref1, inView1] = useRefInView();
    const { isDark } = useDarkThemeMode();

    return (
        <div className="relative bg-cover bg-center" style={{ backgroundImage: "url('tourists-cover.png')" }}>
            <div className="absolute inset-0 bg-gradient-to-r from-gradient1 to-gradient2 opacity-65" />
            <div className="relative z-10">
                <div className="fluid-container pt-16 pb-10 px-4 flex flex-col text-center gap-8">
                    <h1 className="text-white font-bold text-2xl">Forecasting Tourist Arrivals in Philippines</h1>
                    <p className="text-white1">
                        Monthly tourist arrivals in the Philippines from 2008 to April 2025 were forecasted using
                        Facebook's Prophet model, chosen for its ability to effectively capture seasonality, account
                        for holiday effects, and handle abrupt disruptions such as the COVID-19 pandemic. Prophet's
                        strength lies in modeling complex time series patterns, adjusting to trend changes over time,
                        and incorporating external events that influence tourism activity, making it a suitable and reliable
                        tool for forecasting in the travel and hospitality sector.
                    </p>
                </div>

                <div className="px-11 relative z-40">
                    <div className='w-full md:flex-row flex flex-col justify-center gap-10'>
                        <motion.div
                            ref={ref1}
                            {...enterAnimate(0.1, inView1)}
                            className={`max-w-[20rem] w-full drop-shadow-md py-8 flex flex-col items-center gap-10 rounded-2xl md:flex-row transition-colors ${isDark ? 'bg-gradient-to-r from-zinc-950 to-zinc-900' : 'bg-white text-black'}`}
                        >
                            <div className="card-container text-center flex flex-col items-center gap-3">
                                <FaDatabase className="text-bold text-[1.8rem] text-gradient2" />
                                <p className={`${isDark ? 'text-white' : 'text-textBold'} text-2xl font-extrabold`}>
                                    2008 - 2025
                                </p>
                                <p className="text-gray1 font-semibold">
                                    Dataset
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            ref={ref1}
                            {...enterAnimate(0.1, inView1)}
                            className={`max-w-[20rem] w-full drop-shadow-md py-8 flex flex-col items-center gap-10 rounded-2xl md:flex-row transition-colors ${isDark ? 'bg-gradient-to-r from-zinc-950 to-zinc-900' : 'bg-white text-black'}`}
                        >
                            <div className="card-container text-center flex flex-col items-center gap-3">
                                <FaRobot className="text-bold text-[1.8rem] text-gradient2" />
                                <p className={`${isDark ? 'text-white' : 'text-textBold'} text-2xl font-extrabold`}>
                                    Prophet
                                </p>
                                <p className="text-gray1 font-semibold">
                                    Model
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            ref={ref1}
                            {...enterAnimate(0.1, inView1)}
                            className={`max-w-[20rem] w-full drop-shadow-md py-8 flex flex-col items-center gap-10 rounded-2xl md:flex-row transition-colors ${isDark ? 'bg-gradient-to-r from-zinc-950 to-zinc-900' : 'bg-white text-black'}`}
                        >
                            <div className="card-container text-center flex flex-col items-center gap-3">
                                <FaCheck className="text-bold text-[1.8rem] text-gradient2" />
                                <p className={`${isDark ? 'text-white' : 'text-textBold'} text-2xl font-extrabold`}>
                                    0.01956
                                </p>
                                <p className="text-gray1 font-semibold">
                                    RMSE (normalized)
                                </p>
                            </div>
                        </motion.div>

                        <div
                            className={`absolute h-1/2 bottom-0 left-0 right-0 -z-10 ${isDark ? 'bg-darkBg' : 'bg-white1'} transition-colors`}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
