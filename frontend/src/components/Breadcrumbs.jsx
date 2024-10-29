import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Breadcrumbs = () => {
    const location = useLocation();
    const pathnames = location.pathname.split("/").filter(x => x);

    return (
        <nav className="breadcrumb mb-5">
            <ul className="flex space-x-2">
                {pathnames[0] === "home" ? (
                    <li>
                        <Link to="/home" className="text-blue-500 hover:underline">
                            Dashboard
                        </Link>
                    </li>
                ) : (
                    <>
                        <li>
                            <Link to="/home" className="text-blue-500 hover:underline">
                                Dashboard
                            </Link>
                        </li>
                        {pathnames.length > 0 && <span className="mx-2">/</span>}

                        {pathnames.map((value, index) => {
                            const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
                            const isLast = index === pathnames.length - 1;

                            return (
                                <li key={index}>
                                    {isLast ? (
                                        <span className="text-gray-500">
                                            {value.charAt(0).toUpperCase() + value.slice(1).replaceAll('-', ' ')}
                                        </span>
                                    ) : (
                                        <Link to={routeTo} className="text-blue-500 hover:underline">
                                            {value.charAt(0).toUpperCase() + value.slice(1)}
                                        </Link>
                                    )}
                                    {!isLast && <span className="mx-2">/</span>}
                                </li>
                            );
                        })}
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Breadcrumbs;
