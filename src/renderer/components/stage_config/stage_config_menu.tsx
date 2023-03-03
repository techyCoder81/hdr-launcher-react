import { useNavigate } from "react-router-dom";
import { Pages } from "renderer/constants";
import { FocusButton } from "../buttons/focus_button";
import { FullScreenDiv } from "../common/fullscreen_div";
import { StagePreview } from "./stage_preview";

export default function StageConfigMenu() {
    const navigate = useNavigate();
    
    return <FullScreenDiv>
        <FocusButton
            text="Back"
            onClick={() => navigate(Pages.MAIN_MENU)}
            className='simple-button-bigger'
            onFocus={() => {}}
            autofocus
        />
        <StagePreview stageName={'DK_Jungle'}/>
    </FullScreenDiv>
}