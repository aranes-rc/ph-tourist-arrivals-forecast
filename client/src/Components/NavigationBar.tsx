import { useEffect } from "react";
import { useDarkThemeMode } from "../store/useDarkThemeMode";
import { FaGithub } from "react-icons/fa";

export const NavigationBar = () => {
    const { isDark, initializeDarkTheme } = useDarkThemeMode();

    useEffect(() => {
        initializeDarkTheme();
    }, [initializeDarkTheme]);

    return (
        <nav className="fluid-container flex items-center justify-between py-8">
            <div>
            </div>
            <div className={` ${isDark ? 'text-gray-300' : 'text-gray1'} flex items-center text-sm gap-4`}>
                <a href="" target="_blank">
                    <FaGithub className="text-bold text-[1.8rem]" />
                </a>
                <a href="http://www.tourism.gov.ph/tourism_dem_sup_pub.aspx" target="_blank">
                    <img 
                        src="/dot_logo.png" 
                        alt="" 
                        className="w-[2rem] " />
                </a>
            </div>
        </nav>
    );
};
