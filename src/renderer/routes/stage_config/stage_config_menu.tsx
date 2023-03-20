import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FocusCheckbox } from "renderer/components/buttons/focus_checkbox";
import { Pages } from "renderer/constants";
import { ConfigData, load, save } from "renderer/operations/stage_config";
import { Stage, StageInfo } from "renderer/operations/stage_info";
import { FocusButton } from "../../components/buttons/focus_button";
import { FullScreenDiv } from "../../components/fullscreen_div";
import StageListBox from "./stage_list_box";
import { StagePreview } from "./stage_preview";

export default function StageConfigMenu() {
    const navigate = useNavigate();
    const [hoveredStage, setHoveredStage] = useState(null as Stage | null);
    const [config, setConfig] = useState(null as null | ConfigData);
    const [options, setOptions] = useState(null as null | string[])

    useEffect(() => {
        if (config !== null) {
            return;
        }

        load()
            .then(data => setConfig(data))
            .catch(e => alert("failed to preload stage config: " + e));
    }, []);

    useEffect(() => {
        new StageInfo().list()
        .then(list => setOptions(list))
        .catch(e => alert("failed to set new options: " + e));
    }, [config]);
    
    return <FullScreenDiv>
            <div id='header-bar' className="border-bottom" style={{}}>
                <FocusButton
                    text="Back"
                    onClick={async () => {
                        if (config !== null) {
                            save(config);
                        }
                        navigate(Pages.MAIN_MENU);
                    }}
                    className='simple-button-bigger'
                    onFocus={() => {}}
                    autofocus
                />
                {config ?
                <FocusCheckbox
                    text="Enabled"
                    onClick={async () => {
                        config.enabled = !config.enabled;
                        save(config);
                    }}
                    className='simple-button-bigger'
                    onFocus={() => {}}
                    checkStatus={async () => {
                        return config.enabled;
                    }}
                /> : <div/>}
            </div>
            {config && options ?
            <div id='main-content' className="stage-config-body">
                <div style={{width: "40%"}}>
                    <StageListBox 
                        category='Starter' 
                        stages={config.starters}
                        options={options}
                        onUpdate={stages => {
                            let newConfig = new ConfigData(
                                config.enabled,
                                stages,
                                config.counterpicks
                            );
                            save(newConfig);
                            setConfig(newConfig);
                        }}
                        onHover={(stage) => setHoveredStage(stage)}
                    />
                    <StageListBox 
                        category='Counterpick' 
                        stages={config.counterpicks}
                        options={options}
                        onUpdate={stages => {
                            let newConfig = new ConfigData(
                                config.enabled,
                                config.starters,
                                stages
                            );
                            save(newConfig);
                            setConfig(newConfig);
                        }}
                        onHover={(stage) => setHoveredStage(stage)}
                    />
                </div>
                <div style={{width: "60%", height: "100%"}}>
                    <div style={{margin: 10, height: "80%"}}>
                        {hoveredStage !== null ?
                            <StagePreview stage={hoveredStage}/>
                            : <div/>
                        }
                    </div>
                </div>
            </div> : <div>loading...</div>}
    </FullScreenDiv>
}