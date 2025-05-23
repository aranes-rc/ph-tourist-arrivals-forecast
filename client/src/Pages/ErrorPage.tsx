import { useNavigate } from "react-router-dom"

export const ErrorPage = () => {

    const navigate = useNavigate();

    return (
        <div className="fluid-container px-5 flex flex-col text-center justify-center items-center pb-20 mx-auto">
            <h1 className="text-[4rem] font-extrabold ">404</h1>
            <p className="text-[2rem] font-bold">Oops, page not found!</p>
            <p>The page you're looking for might have changed its name, or doesn't exist.</p>
            <button
                className="mt-5 mb-7 px-4 py-2 bg-gradient-to-r from-gradient1 to-gradient2 font-bold text-white rounded-md "
                onClick={() => navigate("/")}
            >
                Go back to Home
            </button>
        </div>
    )
}
