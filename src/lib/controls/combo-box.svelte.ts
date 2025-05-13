import type { Qrwc } from '@q-sys/qrwc';
import { fetchControl, type ControlMetadata } from './base-control.svelte.js'
import type { ControlSubscriber } from '$lib/connection/control-subscriber.svelte.js';

/**
 * Represents a text control that can be used in a Svelte component.
 * 
 * @param ControlName - The name of the control
 * @param Direction - The direction of the control either "Read/Write", "Read Only", or "Write Only"
 * @param Type - The type of the control as reported by Q-SYS. One of "Boolean", "Integer", "Float", "Text", "Trigger", or "Time"
 * @param rawControl - The raw control data provided by the QRWC Library. NOTE: Values in the raw control object are not reactive.
 * @param string - $state of the control's string (string), set to command the control to change its string.
 * @param option - $state of the controls selected index in the choices array. If the current string is not in the choices array, the value will be -1. If the control is set to a value that is not in the choices array or -1, the control will be set to an empty string.
 * @param choices - $state of the array of strings that the control can be set to. This can only be read from the Core, but is reactive
 */
export interface TextComboBoxControl extends ControlMetadata {
    string: string;
    option: number;
    choices: string[];
}


export function fetchComboBox(component:string, control:string, qrwcInstance:Qrwc | null, subscriber:ControlSubscriber):TextComboBoxControl {
    const ctl = fetchControl(component, control,qrwcInstance, subscriber, (update) => {
        choices = update.getMetaProperty("Choices") as unknown as string[] ?? [];
    });
    if(ctl.Type !== "Text") 
        console.error(`Attempted to use a ComboBox on a non-text control: ${control} in component ${component} sent type: ${ctl.Type}`);

    let choices = $state<string[]>(ctl.rawControl?.getMetaProperty("Choices") as unknown as string[] ?? []);

    //This warning has nto bene reliable, so it has been removed.
    // if(choices.length === 0)
    //     console.warn(`ComboBox ${component}, ${control} has no choices`);

    const setText = (val:string) => {
        if(ctl.Direction === "Read Only") {
            console.error(`Attempted to set a read-only control ${control} in component ${component}`);
            return;
        }

        ctl.string = val;
    }

    const setOption = (val:number) => {
        if(val < 0 || val >= choices.length) {
            console.error(`Attempted to set ComboBox ${component}, ${control} to an out-of-range value`);
            setText("");
            return;
        }

        setText(choices[val]);
    }

    let string = $derived<string>(ctl.string as string ?? "");
    let option = $derived<number>(choices.indexOf(ctl.string as string ?? ""));

    return {
        get ControlName() { return ctl.ControlName },
        get Direction() { return ctl.Direction },
        get Type() { return ctl.Type },
        get rawControl() { return ctl.rawControl},
        get string() { return string },
        set string(val:string) { setText(val); },
        get option() { return option },
        set option(val:number) { setOption(val); },
        get choices() { return choices },
    }

}