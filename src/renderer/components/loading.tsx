import { useEffect, useState } from 'react';
import { Backend } from '../operations/backend';
import * as launcher_config from '../operations/launcher_config';
import * as update from '../operations/update';
import '../styles/opening.css';

var will_skip = false;

export default function Loading(props: {onLoad: () => void}) {
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        if (Backend.isSwitch()) {
            launcher_config.getBoolean("skip_launcher")
                .then(skip => {will_skip = skip;setShowButton(skip);})
                .then(() => update.isAvailable())
                .then(available => {
                    if (available && will_skip) {
                        alert("An HDR update is available!");
                        will_skip = false;
                    }
                })
                .catch(e => alert(e));
        } else {
            will_skip = false;
        }
        // set a timeout on exiting the session early if the user hasnt opened the launcher
        setTimeout(() => {
            if (will_skip) {
                Backend.instance().exitSession();
            }
        }, 2500);
    }, []);

    return <div className="overlay-opening"> 
        <div className="loading">
            <h1 className="loading-left hewdraw">HewDraw</h1>
            <h1 className="loading-right remix">Remix</h1>
        </div>
        {will_skip ? <button autoFocus className="loading-button" onClick={() => {will_skip = false;setShowButton(false);}}>(A) Open Launcher</button> : <div/>}
</div> 
}