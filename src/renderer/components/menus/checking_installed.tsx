import { useEffect, useState } from "react";
import { Backend } from "../../operations/backend";

export const CheckingInstalled = (props: {onComplete: (isInstalled: boolean) => void}) => {
    const [installed, setInstalled] = useState(undefined);

    useEffect(() => {
        Backend.instance().isInstalled()
            .then(isInstalled => props.onComplete(isInstalled))
            .catch(e => {
                console.error("Error while checking if HDR is installed!\n" + e);
                alert("Error while checking if HDR is installed!\n" + e);
                props.onComplete(false);
            });
    }, []);

    return <div>checking if HDR is installed...</div>
}