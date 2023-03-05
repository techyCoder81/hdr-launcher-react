import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FocusCheckbox } from "renderer/components/buttons/focus_checkbox";
import { Pages } from "renderer/constants";
import { TourneyConfig } from "renderer/operations/stage_config";
import { FocusButton } from "../../components/buttons/focus_button";
import { FullScreenDiv } from "../../components/fullscreen_div";
import StageListBox from "./stage_list_box";
import { StagePreview } from "./stage_preview";

export default function StageConfigMenu() {
    const navigate = useNavigate();
    const [hoveredStage, setHoveredStage] = useState("");
    
    return <FullScreenDiv>
            <div id='header-bar' className="border-bottom" style={{}}>
                <FocusButton
                    text="Back"
                    onClick={() => navigate(Pages.MAIN_MENU)}
                    className='simple-button-bigger'
                    onFocus={() => {}}
                    autofocus
                />
                <FocusCheckbox
                    text="Enabled"
                    onClick={async () => {
                        let config = (await TourneyConfig.instance().load());
                        config.enabled = !config.enabled;
                        await TourneyConfig.instance().save();
                    }}
                    className='simple-button-bigger'
                    onFocus={() => {}}
                    checkStatus={async () => {
                        return (await TourneyConfig.instance().load()).enabled;
                    }}
                />
            </div>
            <div id='main-content' className="stage-config-body">
                <div style={{width: "40%"}}>
                    <StageListBox category='Starter' onHover={(stage) => setHoveredStage(stage)}/>
                    <StageListBox category='Counterpick' onHover={(stage) => setHoveredStage(stage)}/>
                </div>
                <div style={{width: "60%", height: "100%"}}>
                    <div style={{margin: 10, height: "80%"}}>
                        <StagePreview stageName={hoveredStage}/>
                    </div>
                </div>
            </div>
    </FullScreenDiv>
}