import logo from '../../../../assets/logo_full.png';
import { stageInfo } from '../../operations/stage_info';

function getPreview(name: string) {
    try {
        return require("../../../../assets/stage_previews/stage_2_" + name.toLowerCase() + ".jpg");
    } catch (e) {
        console.warn(e);
        return logo;
    }
}


export const StagePreview = (props: {stageName: string | null}) => {
    if (props.stageName === null) {
        return <div className='image preview'>
            <img src={logo} alt="Logo" />
        </div>
    }

    return <div className='image preview' key={props.stageName}>
            <h1 style={{
                border: "3px solid var(--main-button-border-color)",
                transform: "skewX(-20deg)",
                boxShadow: "3px 3px 5px #333",
                backgroundColor: "var(--main-button-bg-color)",
                color: "var(--main-text-color)",
                fontSize: "2rem",
                textAlign: "right", 
                position: 'absolute',
                paddingLeft: "25px",
                top: 15,
                left: -20
            }}>{(stageInfo[props.stageName] ? stageInfo[props.stageName].display_name : props.stageName) + '\u00A0'}</h1>
            <img src={getPreview(props.stageName)} alt="Preview" />
    </div>
}
