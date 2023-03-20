import { useEffect, useState } from "react";
import { FocusButton } from "renderer/components/buttons/focus_button";
import { FocusCombo } from "renderer/components/buttons/focus_combo";
import { Backend } from "renderer/operations/backend";
import { } from "renderer/operations/stage_config";
import { Stage, StageInfo } from "renderer/operations/stage_info";

type Categories = 'Starter' | 'Counterpick';
const MAX_STAGES = 7;
const BACKGROUND_COLOR = 'var(--main-button-bg-color)';
const LEGACY_CONFIG_FILE = 'ultimate/mods/hdr-stages/ui/param/database/ui_stage_db.prcxml';

export default function StageListBox(props: {
    category: Categories, 
    stages: Stage[], 
    options: string[],
    onUpdate: (stages: Stage[]) => void, 
    onHover?: (stage: Stage) => void
}) {
    const [stages, setStages] = useState(props.stages);

    return <div style={{height: "300px", position: "relative", padding: 0}}>
        <div className="thick-border" style={{position: "relative", top: '2.5%', left: '2.5%', height: '95%', width: '95%'}}>
            <h2 style={{color: "white", backgroundColor: BACKGROUND_COLOR, padding: 5}} className="border-bottom">{props.category}s</h2>
            {props.options ?
                stages.map((entry, idx) => <StageListItem 
                    options={props.options}
                    selected={entry} 
                    onChange={async item => {
                        let info = new StageInfo();
                        let stage = await info.get(item.target.value);
                        props.stages[idx] = stage;
                        props.onUpdate(props.stages);
                    }}
                    onHover={props.onHover}
                    onRemove={() => {
                        let newSelected: Stage[] = [];
                        console.info("ignoring: " + idx);
                        props.stages.forEach((entry, thisIdx) => {if (idx != thisIdx) {newSelected.push(entry)}});
                        props.onUpdate(newSelected);
                        setStages(newSelected);
                    }}
                />) : <div/>  
            }
            {
            props.stages.length < MAX_STAGES ? <FocusButton
                className="hover-color"
                text="+"
                style={{width: "100%", color: 'lightgreen', fontWeight: 'bold', fontSize: "large", paddingTop: 3, paddingBottom: 1, paddingLeft: 10, paddingRight: 10}}
                onClick={async () => {
                    let newSelected = [];
                    let info = new StageInfo();
                    let firstAvailable = await info.get((await info.list())[0]);
                    props.stages.forEach(entry => newSelected.push(entry));
                    newSelected.push(firstAvailable);
                    props.onUpdate(newSelected);
                    setStages(newSelected);
                }}
                onFocus={() => {}}
            /> : <div/>
            }
        </div>
    </div>
}

/**
 * Represents a row in the stage list window, including a combo box (dropdown) and a 'remove' button
 * @param props.onChange what to do if the selection changes
 * @param props.onRemove what to do if the remove button is pressed
 * @param props.selected the selected value
 * @returns void
 */
function StageListItem(props: {options: string[], onChange: (item: {target: {value: string}}) => void, onRemove: () => void, selected: Stage, onHover?: (stage: Stage) => void}) {
    return <div>
        <FocusCombo 
            className="hover-color"
            style={{width: "90%", color: 'white', fontSize: "large", paddingTop: 3, paddingBottom: 3}}
            onChange={props.onChange}
            forcedValue={props.selected.nameId}
            onFocus={() => {if (props.onHover) {props.onHover(props.selected)}}}
            options={props.options} 
        />
        <FocusButton
            className="hover-color"
            style={{width: "10%", color: 'pink', fontWeight: 'bold', fontSize: "large", paddingTop: 3, paddingBottom: 1}}
            text='X'
            onFocus={() => {if (props.onHover) {props.onHover(props.selected)}}}
            onClick={props.onRemove}
        />
    </div>
}