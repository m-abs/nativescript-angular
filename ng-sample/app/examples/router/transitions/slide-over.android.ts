/// <reference path="../../../../node_modules/tns-platform-declarations/android.d.ts" />

import * as platform from "tns-core-modules/platform";
import { AndroidTransitionType, Transition } from "tns-core-modules/ui/transition";
import lazy from "tns-core-modules/utils/lazy";

import { AnimationDirection } from "./slide-over";

const screenWidth = lazy(() => platform.screen.mainScreen.widthPixels);
const screenHeight = lazy(() => platform.screen.mainScreen.heightPixels);

function makeAnimator(
  prop: string,
  start: number,
  end: number,
  duration?: number,
  curve?: any): android.animation.Animator {
  // console.log(`${prop} -> ${start} -> ${end}`);

  const translationYValues = Array.create("float", 2);
  translationYValues[0] = start;
  translationYValues[1] = end;

  const animator = android.animation.ObjectAnimator.ofFloat(null, prop, translationYValues);
  if (animator && duration !== undefined) {
    animator.setDuration(duration);
  }
  if (animator && curve !== undefined) {
    animator.setInterpolator(curve);
  }
  return animator;
}

// const floatType = java.lang.Float.class.getField('TYPE').get(null);

const fadedOutAlpha = 0.0;
const fadedInAlpha = 1.0;

export class SlideOverTransition extends Transition {
  private direction: AnimationDirection;
  private fade = false;

  constructor(direction: AnimationDirection, duration?: number, curve?: any) {
    super(duration, curve);
    this.direction = direction;
  }

  public setFade(fade: boolean) {
    this.fade = fade;
  }

  public createAndroidAnimator(transitionType: string): android.animation.Animator {
    const animators: android.animation.Animator[] = [];
    const animatorSet = new android.animation.AnimatorSet();
    const fullDuration = this.getDuration() || 300;
    const curve = this.getCurve() || "easeOut";

    switch (transitionType) {
      /* toView entering */
      case AndroidTransitionType.enter: {
        if (this.fade) {
          animators.push(makeAnimator("alpha", fadedOutAlpha, fadedInAlpha, fullDuration / 2));
        }
        animators.push(makeAnimator("translationZ", 0, 1, 0));
        switch (this.direction) {
          case "up": {
            animators.push(makeAnimator("translationY", screenHeight(), 0, fullDuration, curve));
            break;
          }
          case "down": {
            animators.push(makeAnimator("translationY", -screenHeight(), 0, fullDuration, curve));
            break;
          }
          case "left": {
            animators.push(makeAnimator("translationX", screenWidth(), 0, fullDuration, curve));
            break;
          }
          case "right": {
            animators.push(makeAnimator("translationX", -screenWidth(), 0, fullDuration, curve));
            break;
          }
          default: {
            throw new Error("Unknown direction");
          }
        }
        break;
      }
      /* fromView hidden */
      case AndroidTransitionType.exit: {
        if (this.fade) {
          animators.push(makeAnimator("alpha", fadedInAlpha, fadedOutAlpha, fullDuration / 2));
        }
        animators.push(makeAnimator("translationZ", 1, 0, 0));
        animators.push(makeAnimator("translationY", 0, 0, fullDuration));
        break;
      }
      /* fromView re-appearing */
      case AndroidTransitionType.popEnter: {
        if (this.fade) {
          animators.push(makeAnimator("alpha", fadedOutAlpha, fadedInAlpha, fullDuration / 2));
        }
        animators.push(makeAnimator("translationY", 0, 0, 0));
        break;
      }
      /* toView exiting */
      case AndroidTransitionType.popExit: {
        if (this.fade) {
          animators.push(makeAnimator("alpha", fadedInAlpha, fadedOutAlpha, fullDuration / 2));
        }
        switch (this.direction) {
          case "up": {
            animators.push(makeAnimator("translationY", 0, screenHeight(), fullDuration, curve));
            break;
          }
          case "down": {
            animators.push(makeAnimator("translationY", 0, -screenHeight(), fullDuration, curve));
            break;
          }
          case "left": {
            animators.push(makeAnimator("translationX", 0, screenWidth(), fullDuration, curve));
            break;
          }
          case "right": {
            animators.push(makeAnimator("translationX", 0, -screenWidth(), fullDuration, curve));
            break;
          }
          default: {
            throw new Error("Unknown direction");
          }
        }
        break;
      }
      default: {
        throw new Error("Unknown type");
      }
    }

    if (animators.length === 0) {
      return animatorSet;
    }

    const objectAnimators = Array.create(android.animation.Animator, animators.length);
    for (let i = 0; i < animators.length; i++) {
      objectAnimators[i] = animators[i];
    }

    animatorSet.playTogether(objectAnimators);

    return animatorSet;
  }
}

export class SlideUpAndOverTransition extends SlideOverTransition {
  constructor(duration?: number, curve?: any) {
    super("up", duration, curve)
  }
}

export class SlideDownAndOverTransition extends SlideOverTransition {
  constructor(duration?: number, curve?: any) {
    super("down", duration, curve)
  }
}

export class SlideLeftAndOverTransition extends SlideOverTransition {
  constructor(duration?: number, curve?: any) {
    super("left", duration, curve)
  }
}

export class SlideRightAndOverTransition extends SlideOverTransition {
  constructor(duration?: number, curve?: any) {
    super("right", duration, curve)
  }
}
