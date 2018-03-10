import { Transition } from "tns-core-modules/ui/transition";

export type AnimationDirection = "up" | "down" | "left" | "right";

export class SlideOverTransition extends Transition {
  constructor(direction: AnimationDirection, duration?: number, curve?: any);
}

export class SlideUpAndOverTransition extends Transition {
  constructor(duration?: number, curve?: any);
}

export class SlideDownAndOverTransition extends Transition {
  constructor(duration?: number, curve?: any);
}

export class SlideLeftAndOverTransition extends Transition {
  constructor(duration?: number, curve?: any);
}

export class SlideRightAndOverTransition extends Transition {
  constructor(duration?: number, curve?: any);
}