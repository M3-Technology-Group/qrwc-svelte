import type { ControlDecorator } from '@q-sys/qrwc/dist/managers/components/ControlDecorator.js';

export const allControlDirections = ['Read/Write', 'Read Only', 'Write Only'] as const;
export type ControlDirection = (typeof allControlDirections)[number] | undefined;

/**
 * Get the direction property of a control and convert it to a union type.
 * Returns undefined if the property is not found or if any other error occurs.
 * @param controlData Control Decorator object
 * @returns "Read/Write" or "Read Only" or "Write Only" or undefined
 */
export function getDirectionProperty(
	controlData: ControlDecorator | undefined
): ControlDirection | undefined {
	if (!controlData) return undefined;
	try {
		const direction = controlData.getMetaProperty('Direction') as string | undefined;

		if (!direction) return undefined;

		if (allControlDirections.some((lit) => lit === direction)) {
			return allControlDirections.find((d) => d === direction) as ControlDirection;
		}
		return undefined;
	} catch {
		return undefined;
	}
}

export const allControlTypes = ['Boolean', 'Integer', 'Float', 'Text', 'Trigger', 'Time'] as const;
export type ControlType = (typeof allControlTypes)[number] | undefined;

/**
 * Get the type property of a control and convert it to a union type.
 * @param controlData Control Decorator object
 * @returns
 */
export function getTypeProperty(controlData: ControlDecorator | undefined): ControlType {
	if (!controlData) return undefined;
	try {
		const type = controlData.getMetaProperty('Type') as string | undefined;

		if (!type) return undefined;

		if (allControlTypes.some((lit) => lit === type)) {
			return allControlTypes.find((d) => d === type) as ControlType;
		}
		return undefined;
	} catch {
		return undefined;
	}
}
