import { SyncLoader, BarLoader } from "react-spinners"

export const SkeletonLoadingSmall = () => {
    return (
        <div className=" w-40 h-3 bg-gray-300 rounded animate-pulse"></div>
    )
}

export const SkeletonLoadingMedium = () => {
    return (
        <div className="h-3 w-10 bg-gray-300 rounded animate-pulse"></div>
    )
}

export const GraphSkeletonLoading = () => {
    return (
        <div className='h-[30rem] max-h-30 overflow-y-auto flex justify-center items-center'>
            <SyncLoader color="#3B19C2" size={15} margin={5} />
        </div>
    );
};

export const ExportButtonLoader = () => {
    return (
        <div className='flex items-center gap-3 border border-gray2 py-2 px-4 rounded-md'>
            <BarLoader color="#3B19C2" />
        </div>
    );
};
