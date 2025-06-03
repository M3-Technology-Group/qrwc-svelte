import { fetchControl } from '$lib/controls/base-control.svelte.js';
import type { GenericControl } from '$lib/controls/base-control.svelte.js';
import type { ButtonControl } from '$lib/controls/button.svelte.js';
import { fetchButton } from '$lib/controls/button.svelte.js';
import { fetchComboBox } from '$lib/controls/combo-box.svelte.js';
import type { TextComboBoxControl } from '$lib/controls/combo-box.svelte.js';
import { fetchKnob } from '$lib/controls/knob.svelte.js';
import type { KnobControl } from '$lib/controls/knob.svelte.js';
import { fetchText } from '$lib/controls/text.svelte.js';
import type { TextControl } from '$lib/controls/text.svelte.js';
import { fetchTrigger } from '$lib/controls/trigger.svelte.js';
import type { TriggerControl } from '$lib/controls/trigger.svelte.js';
import type { Qrwc, Component as IComponent} from '@q-sys/qrwc';

/**
 * Instance of a component in the current Q-SYS design.
 * Provides access to the component's metadata and controls.
 * 
 * Will only instantiate if the component exists the the Q-SYS design and is not
 * excluded by the control filter passed into the QRWC Wrapper instance.
 * 
 * @throws {Error} If the component does not exist in the Q-SYS design or is excluded by the control filter.
 */
export class Component {
	private componentId: string;
	private thisComponent: IComponent;
	private qrwcInstance: Qrwc;

    /**
     * DO NOT USE THIS CONSTRUCTOR DIRECTLY.
     * 
     * Use the `useComponent` method on the QRWC Wrapper instance to create a Component instance.
     * 
     * @param componentId - The ID (Code Name) of the component in Q-SYS Designer.
     * @param qrwcInstance - The QRWC Wrapper instance.
     */
	constructor(componentId: string, qrwcInstance: Qrwc | null) {
		this.componentId = componentId;

		if (!qrwcInstance) {
			throw new Error(
				`QRWC instance not found, please connect to a core before using this component.`
			);
		}

		if (!qrwcInstance.components[componentId]) {
			throw new Error(`Component ${componentId} not found`);
		}

		this.thisComponent = qrwcInstance.components[componentId];
		this.qrwcInstance = qrwcInstance;
	}

    /**
     * Get the user defined name of the component.
     * 
     * @returns {string} The name of the component.
     */
	public get Name(): string {
		return this.thisComponent.name;
	}
    
    /**
     * Get the ID (Code Name) of the component.
     * 
     * @returns {string} The ID of the component.
     */
	public get Id(): string {
		return this.thisComponent.state.ID;
	}

    /**
     * Get the type of the component as defined by Q-SYS Designer.
     * 
     * @returns {string} The type of the component.
     */
	public get Type(): string {
		return this.thisComponent.state.Type;
	}


    /**
     * Get the list of controls in this component in the current Q-SYS design.
     * 
     * @returns Array of control names in the specified component. Empty array if the component does not exist.
     */
    public getControlList = ():string[] => Object.keys(this.thisComponent.controls)



	/**
	 * Fetch and subscribe to a generic component in a Q-SYS design.
	 * This should only be used for components that do not have a specific
	 * use method defined by this library (EG: Buttons, Knobs, Text).
	 *
	 * Reactive String, Position and Value properties are returned.
	 * If the control subscribed to does not support one of these properties,
	 * the property will be left as undefined.
	 *
	 * An error may be thrown if string, position or value is set on a control
	 * that does not support that property.
	 *
	 * @param control Control name inside the component to use.
	 * @returns {GenericControl} object that can be used in a Svelte component.
	 */
	public useControl = (control: string): GenericControl =>
		fetchControl(this.thisComponent.controls[control]);

	/**
	 * Fetch and Subscribe to a Button control in a Q-SYS design.
	 * This can be use with Monetary or Toggle buttons.
	 *
	 * State is reactive and provides feedback, state can be set to command the control.
	 *
	 * @param control Control name inside the component to use.
	 * @returns {ButtonControl} object that can be used in a Svelte component.
	 */
	public useButton = (control: string): ButtonControl =>
		fetchButton(this.thisComponent.controls[control]);

	/**
	 * Fetch a Trigger button control in a Q-SYS design.
	 *
	 * Trigger buttons are one-way and don't provide feedback.
	 * Trigger controls only provide a trigger method and control metadata.
	 *
	 * @param control Control name inside the component to use.
	 * @returns {TriggerControl} object that can be used in a Svelte component.
	 */
	public useTrigger = (control: string): TriggerControl =>
		fetchTrigger(this.thisComponent.controls[control]);

	/**
	 * Fetch and Subscribe to a Knob control in a Q-SYS design.
	 * This can be used with Float, Integer, and Time controls.
	 * This includes: faders, gains, frequency controls, pans, etc.
	 *
	 * String includes applicable units (db, Hz, etc).
	 * Position is a float from 0-1.
	 * Value is the numeric value of the control.
	 * String, position and Value are all reactive and can be set to command the control.
	 *
	 * Min an Max values are provided for Value and String.
	 *
	 * @param control Control name inside the component to use.
	 * @returns { KnobControl } object that can be used in a Svelte component.
	 */
	public useKnob = (control: string): KnobControl =>
		fetchKnob(this.thisComponent.controls[control]);

	/**
	 * Fetch and Subscribe to a Text control in a Q-SYS design.
	 *
	 * This can be used with any text control in Q-SYS.
	 *
	 * String is reactive and can be set to command the control.
	 *
	 * @param control Control name inside the component to use.
	 * @returns { TextControl } object that can be used in a Svelte component.
	 */
	public useText = (control: string): TextControl =>
		fetchText(this.thisComponent.controls[control]);

	/**
	 * Fetch and subscribe to a combo box control in a Q-SYS design.
	 *
	 * This will return a control object that can be used in a Svelte component.
	 *
	 * String, Option, and can be set to command the control.
	 * Choices array is also reactive and will by dynamically updated if changed on the core.
	 * Choices array is read-only and cannot be set.
	 *
	 * @param control Control name inside the component to use.
	 * @returns {TextComboBoxControl} object that can be used in a Svelte component.
	 */
	public useComboBox = (control: string): TextComboBoxControl =>
		fetchComboBox(this.thisComponent.controls[control]);
}
