import { Backend } from "./backend";

/**
 * This class exists to fill a specific need.
 * On Switch, the control stick is too sensitive
 * when navigating components. The dpad is fine,
 * but moving the stick up or down results very
 * easily in navigating multiple components in
 * sequence. This class exists to measure how
 * often focus transitions should be allowed.
 */
export default class FocusTimer {
    /** the last time a transition was allowed */
    private static last_time = new Date().getTime();

    /** the minimum waiting time between transitions */
    private static MIN_WAIT_TIME = 150;

    static request(): boolean {
        // focus changes don't need to be limited on electron
        if (Backend.isNode()) {
            return true;
        }

        let current_time = new Date().getTime();
        if (current_time - this.last_time < this.MIN_WAIT_TIME) {
            return false;
        } else {
            this.last_time = current_time;
            return true;
        }
    }
}