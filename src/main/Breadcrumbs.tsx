import {Link, useLocation} from "react-router-dom";
import {Path, PathToName} from "./pathToName";

export function Breadcrumbs() {
    const location = useLocation();
    const pathnames: string[] = location.pathname.split("/").filter((x) => x);

    return pathnames.length <= 1 ? <></> : (
        <nav>
            {pathnames.length > 0 ? (
                <Link to="/mathplay">Games</Link>
            ) : (
                <span>Home</span>
            )}

            {pathnames.map((value: string, index: number) => {
                const to = `/${pathnames.slice(0, index + 1).join("/")}` as Path;

                return (
                    <span key={to}>
            {"/"}
                        {index + 1 === pathnames.length ? (
                            <span>{PathToName[to]}</span>
                        ) : (
                            <Link to={to}>{PathToName[to]}</Link>
                        )}
          </span>
                );
            })}
        </nav>
    );
}
