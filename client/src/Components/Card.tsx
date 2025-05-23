import React from 'react';

interface CardProps {
    title: React.ReactNode; 
    content: React.ReactNode;
    icon: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, content, icon }) => {
    return (
        <div className=" bg-white flex flex-col gap-3 drop-shadow-md rounded-lg py-8 px-16 ">
            <h2 className="text-sm text-gray1 font-semibold">{title}</h2>
            <div className="flex items-center gap-4">
                {icon}
                <p className="text-textBold text-2xl font-extrabold">{content}</p>
            </div>
        </div>
    );
};

