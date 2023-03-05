import { useEffect, useState } from "react";
import { FocusButton } from "renderer/components/buttons/focus_button";
import { FocusCombo } from "renderer/components/buttons/focus_combo";
import { Backend } from "renderer/operations/backend";
import { TourneyConfig } from "renderer/operations/stage_config";
import { displayNames, stageInfo } from "renderer/operations/stage_info";

type Categories = 'Starter' | 'Counterpick';
const MAX_STAGES = 7;
const BACKGROUND_COLOR = 'var(--main-button-bg-color)';
const LEGACY_CONFIG_FILE = 'ultimate/mods/hdr-stages/ui/param/database/ui_stage_db.prcxml';

export default function StageListBox(props: {category: Categories, onHover?: (stage: string) => void}) {
    const [selected, setSelected] = useState([] as string[]);
    const [reload, setReload] = useState(true);

    // load the configured stages from storage
    useEffect(() => {
        // get the actually configured stages and set it
        // avoid infinite recursion
        if (!reload) {
            return;
        }
        setSelected([]);
        TourneyConfig.instance()
            .load()
            .then(data => {
                if (props.category == 'Starter') {
                    setSelected(data.starters);
                } else {
                    setSelected(data.counterpicks);
                }
                setReload(false);
                
            })
            .then(() => {TourneyConfig.instance().save()})
            .catch(e => alert("Error loading selected stages: " + e))
    }, [reload]);

    useEffect(() => {
        // get the actually configured stages and set it
        // avoid infinite recursion
        if (!reload) {
            return;
        }
        TourneyConfig.instance()
            .load()
            .then(async data => {
                // delete the old prcxml file for the old tourney mode mechanism
                let backend = Backend.instance();
                let sdroot = await backend.getSdRoot();
                let legacyConfig = sdroot + LEGACY_CONFIG_FILE;
                let exists = await backend.fileExists(legacyConfig);
                if (exists) {
                    await backend.deleteFile(legacyConfig);
                }

                if (props.category == 'Starter') {
                    setSelected(data.starters);
                } else {
                    setSelected(data.counterpicks);
                }
                
            })
            .then(() => {TourneyConfig.instance().save()})
            .catch(e => alert("Error loading selected stages: " + e))
    }, []);

    return <div style={{height: "300px", position: "relative", padding: 0}}>
        <div className="thick-border" style={{position: "relative", top: '2.5%', left: '2.5%', height: '95%', width: '95%'}}>
            <h2 style={{color: "white", backgroundColor: BACKGROUND_COLOR, padding: 5}} className="border-bottom">{props.category}s</h2>
            {
                selected.map((entry, idx) => <StageListItem 
                    selected={entry} 
                    onChange={item => {
                        selected[idx] = item.target.value;
                        let data = TourneyConfig.instance().data;
                        if (data !== undefined) {
                            if (props.category == 'Starter') {
                                data.starters[idx] = item.target.value;
                            } else {
                                data.counterpicks[idx] = item.target.value;
                            }
                        }
                        setSelected(selected);
                        setReload(true);
                    }}
                    onHover={props.onHover}
                    onRemove={() => {
                        let newSelected: string[] = [];
                        console.info("ignoring: " + idx);
                        selected.forEach((entry, thisIdx) => {if (idx != thisIdx) {newSelected.push(entry)}});

                        let data = TourneyConfig.instance().data;
                        if (data !== undefined) {
                            if (props.category == 'Starter') {
                                data.starters.splice(idx, 1);
                            } else {
                                data.counterpicks.splice(idx, 1);
                            }
                        }
                        setSelected(newSelected);
                        setReload(true);
                    }}
                />)    
            }
            {
            selected.length < MAX_STAGES ? <FocusButton
                className="hover-color"
                text="+"
                style={{width: "100%", color: 'lightgreen', fontWeight: 'bold', fontSize: "large", paddingTop: 3, paddingBottom: 1, paddingLeft: 10, paddingRight: 10}}
                onClick={async () => {
                    let newSelected = [];
                    selected.forEach(entry => newSelected.push(entry));
                    newSelected.push(displayNames()[0]);
                    
                    let data = TourneyConfig.instance().data;
                    if (data !== undefined) {
                        if (props.category == 'Starter') {
                            data.starters.push(displayNames()[0]);
                        } else {
                            data.counterpicks.push(displayNames()[0]);
                        }
                    }
                    setSelected(newSelected);
                    setReload(true);
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
function StageListItem(props: {onChange: (item: any) => void, onRemove: () => void, selected: string, onHover?: (stage: string) => void}) {
    return <div>
        <FocusCombo 
            className="hover-color"
            style={{width: "90%", color: 'white', fontSize: "large", paddingTop: 3, paddingBottom: 3}}
            onChange={props.onChange}
            defaultValue={props.selected}
            onFocus={() => {if (props.onHover) {props.onHover(props.selected)}}}
            options={displayNames()} 
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