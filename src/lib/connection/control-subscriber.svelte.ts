import type { Qrwc } from '@q-sys/qrwc';
import type { ControlDecorator } from '@q-sys/qrwc/dist/managers/components/ControlDecorator.js';

export class ControlSubscriber {
	/**
	 * All subscriptions are stored here based on component ID as the key
	 */
	private subscriptions: Record<string, Subscription[]> = {};
	/**
	 * Dictionary of component IDs to subscription IDs - used to make looking up a subscription
	 * easier when it comes time to unsubscribe
	 */
	private subscriptionIdTable: Record<number, string> = {};

	constructor() {}

	/**
	 * Subscribe to changes from a control
	 * @param component component ID/Name
	 * @param control control ID/Name
	 * @param updater function to be invoked when a new value exists, called with the Control Decorator Object.
	 * @returns unique subscription ID, Used to unsubscribe from this subscription.
	 */
	public subscribeControl(
		component: string,
		control: string,
		updater: (ctl: ControlDecorator) => void
	): number {
		const subscriptionId = this.getNewSubscriptionId();

		//if there is no subscription for this component, create one
		if (!this.subscriptions.hasOwnProperty(component)) {
			this.subscriptions[component] = [];
		}

		//add the subscription to the subscriptions array
		this.subscriptions[component].push({
			id: subscriptionId,
			component: component,
			control: control,
			updater: updater
		});

		//add the subscription ID to the subscription ID table
		this.subscriptionIdTable[subscriptionId] = component;

		return subscriptionId;
	}

	/**
	 * Unsubscribe from a control
	 * @param subscriptionId subscription ID to unsubscribe from
	 */
	public unsubscribeControl(subscriptionId: number) {
		//if there is no subscription with this ID, return
		if (!this.subscriptionIdTable.hasOwnProperty(subscriptionId)) return;

		const componentId = this.subscriptionIdTable[subscriptionId];

		if (!this.subscriptions.hasOwnProperty(componentId)) {
			delete this.subscriptionIdTable[subscriptionId];
			console.warn(
				`Subscription ID ${subscriptionId} does not exist in the subscription table, but for some reason exists in the subscription ID table. This is a bug.`
			);
			return;
		}

		//remove the subscription from the subscriptions array
		this.subscriptions[componentId] = this.subscriptions[componentId].filter(
			(sub) => sub.id !== subscriptionId
		);

		if (this.subscriptions[componentId].length === 0) {
			delete this.subscriptions[componentId];
		}

		//remove the subscription ID from the subscription ID table
		delete this.subscriptionIdTable[subscriptionId];
	}

    /**
     * Process an update event from QRWC, notifies all subscribers of the updated control
     * 
     * @param event Update Event from QRWC
     */
	public processControlEvent(event: Record<string, ControlDecorator>) {
		for (const key in event) {
			if (!this.subscriptions.hasOwnProperty(key)) continue;

			this.subscriptions[key].forEach((sub) => {
				if (event[key].Name === sub.control) {
					sub.updater(event[key]);
				}
			});
		}
	}

    /**
     * Propagate initial values to all subscriptions
     * This is necessary because the initial values of the controls are not available
     * until the startComplete event is fired
     * 
     * @param qrwc QRWC instance that is connected and started
     */
    public  propagateInitialValues(qrwc:Qrwc): void {
        if(!qrwc) return;
        for(const key in this.subscriptions){
            const value = this.subscriptions[key];
    
            value.forEach(sub => {
                try {
                    const controlData = qrwc.components[sub.component]?.[sub.control];
                    if(!controlData) {
                        console.error(`QRWC Control ${sub.control} not found in component ${sub.component}`);
                        return;
                    }
                    sub.updater(controlData);
                }
                catch
                {
                    console.error(`QRWC: Error updating subscription ${sub.id}`);
                }
            });
        }
    }

	/**
	 * Flush all subscriptions, this should only be called when a user desired to dispose of the wrapper.
	 */
	public flushSubscriptions() {
		this.subscriptions = {};
		this.subscriptionIdTable = {};
	}

	/**
	 * Generate a unique subscription ID, this can just be a number that increments each time a new subscription is created.
	 */
	private subscriptionCount: number = 0;
	private getNewSubscriptionId(): number {
		return this.subscriptionCount++;
	}
}

interface Subscription {
	id: number;
	component: string;
	control: string;
	updater: (ctl: ControlDecorator) => void;
}
