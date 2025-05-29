import type { Control, Qrwc } from '@q-sys/qrwc';
import { fetchControl, type ControlMetadata } from './base-control.svelte.js';

/**
 * Represents a knob control that can be used in a Svelte component.
 *
 * @param ControlName - The name of the control
 * @param Direction - The direction of the control either "Read/Write", "Read Only", or "Write Only"
 * @param Type - The type of the control as reported by Q-SYS. One of "Boolean", "Integer", "Float", "Text", "Trigger", or "Time"
 * @param rawControl - The raw control data provided by the QRWC Library. NOTE: Values in the raw control object are not reactive.
 * @param value - $state of the control's value (number), set to command the control to change its value.
 * @param valueMin - The minimum numeric value of the control as reported by the Core.
 * @param valueMax - The maximum numeric value of the control as reported by the Core.
 * @param position - $state of the control's position (float 0-1), set to command the control to change its position.
 * @param string - $state of the control's string (string), set to command the control to change its string.
 * @param stringMin - The minimum string value of the control as reported by the Core.
 * @param stringMax - The maximum string value of the control as reported by the Core.
 */
export interface KnobControl extends ControlMetadata {
	value: number;
	valueMin: number | undefined;
	valueMax: number | undefined;
	position: number;
	string: string;
	stringMin: string | undefined;
	stringMax: string | undefined;
}

export function fetchKnob(
	control: Control
): KnobControl {
	const ctl = fetchControl(control);
	if (ctl.Type !== 'Float' && ctl.Type !== 'Integer' && ctl.Type !== 'Time' && ctl.Type !== 'Array')
		console.error(`Attempted to use a knob on a non-numeric control: ${control.name} in component ${control.component.name} sent type: ${ctl.Type}`);

	//Value
	const setValue = (val: number) => {
		if (ctl.Direction === 'Read Only') {
			console.error(`Attempted to set a read-only control ${control.name} in component ${control.component.name}`);
			return;
		}

		ctl.value = val;
	};

	let numberValue = $derived<number>((ctl.value as number) ?? 0);

	//Position
	const setPosition = (val: number) => {
		if (ctl.Direction === 'Read Only') {
			console.error(`Attempted to set a read-only control ${control.name} in component ${control.component.name}`);
			return;
		}

		ctl.position = val;
	};
	let position = $derived<number>((ctl.position as number) ?? 0);

	//String
	const setString = (val: string) => {
		if (ctl.Direction === 'Read Only') {
			console.error(`Attempted to set a read-only control ${control.name} in component ${control.component.name}`);
			return;
		}

		ctl.string = val;
	};

	let string = $derived<string>((ctl.string as string) ?? '');

	return {
		get ControlName() {
			return ctl.ControlName;
		},
		get Direction() {
			return ctl.Direction;
		},
		get Type() {
			return ctl.Type;
		},
		get rawControl() {
			return ctl.rawControl;
		},
		get value() {
			return numberValue;
		},
		set value(val: number) {
			setValue(val);
		},
		get valueMin() {
			return ctl.rawControl?.state.ValueMin as number | undefined;
		},
		get valueMax() {
			return ctl.rawControl?.state.ValueMax as number | undefined;
		},
		get position() {
			return position;
		},
		set position(val: number) {
			setPosition(val);
		},
		get string() {
			return string;
		},
		set string(val: string) {
			setString(val);
		},
		get stringMin() {
			return ctl.rawControl?.state.StringMin as string | undefined;
		},
		get stringMax() {
			return ctl.rawControl?.state.StringMax as string | undefined;
		}
	};
}
