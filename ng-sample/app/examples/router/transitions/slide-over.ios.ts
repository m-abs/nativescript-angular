/// <reference path="../../../../node_modules/tns-platform-declarations/ios.d.ts" />

import * as platform from "tns-core-modules/platform";
import { Transition } from "tns-core-modules/ui/transition";
import lazy from "tns-core-modules/utils/lazy";

import { AnimationDirection } from "./slide-over";

export function iosAnimationCurve(curve: string): UIViewAnimationCurve {
  switch (curve) {
    case "easeIn": {
      return UIViewAnimationCurve.EaseIn;
    }
    case "easeOut": {
      return UIViewAnimationCurve.EaseOut;
    }
    case "easeInOut": {
      return UIViewAnimationCurve.EaseInOut;
    }
    default: {
      return UIViewAnimationCurve.Linear;
    }
  }
}

const bottomViewAlphaFaded = 0.2;

const screenHeightDIPs = lazy(() => platform.screen.mainScreen.heightDIPs);
const screenWidthDIPs = lazy(() => platform.screen.mainScreen.widthDIPs);
const iosTranslationLeftEdge = lazy(() => CGAffineTransformMakeTranslation(-screenWidthDIPs(), 0));
const iosTranslationRightEdge = lazy(() => CGAffineTransformMakeTranslation(screenWidthDIPs(), 0));
const iosTranslationTopEdge = lazy(() => CGAffineTransformMakeTranslation(0, -screenHeightDIPs()));
const iosTranslationBottomEdge = lazy(() => CGAffineTransformMakeTranslation(0, screenHeightDIPs()));

export class SlideOverTransition extends Transition {
  private direction: AnimationDirection;
  private fadeBottomView = false;
  private shiftBottomView = false;

  constructor(direction: AnimationDirection, duration: number, curve: any) {
    super(duration, curve);
    this.direction = direction;
  }

  public setFade(useFading: boolean) {
    this.fadeBottomView = useFading;
  }

  public setShiftBottomView(shiftBottomView: boolean) {
    this.shiftBottomView = shiftBottomView;
  }

  public animateIOSTransition(
    containerView: UIView,
    fromView: UIView,
    toView: UIView,
    operation: UINavigationControllerOperation,
    completion: (finished: boolean) => void
  ): void {
    const isPush = (operation === UINavigationControllerOperation.Push);
    const topView = isPush ? toView : fromView;
    const bottomView = isPush ? fromView : toView;

    const duration = this.getDuration() || 0.3;
    const curve = this.getCurve();

    let topViewTransform: CGAffineTransform;
    let bottomViewTransform: CGAffineTransform;

    switch (this.direction) {
      case "up": {
        topViewTransform = iosTranslationBottomEdge();
        bottomViewTransform = CGAffineTransformMakeTranslation(0, screenHeightDIPs() / 5);
        break;
      }
      case "down": {
        topViewTransform = iosTranslationTopEdge();
        bottomViewTransform = CGAffineTransformMakeTranslation(0, -screenHeightDIPs() / 5);
        break;
      }
      case "left": {
        topViewTransform = iosTranslationRightEdge();
        bottomViewTransform = CGAffineTransformMakeTranslation(-screenWidthDIPs() / 5, 0);
        break;
      }
      case "right": {
        topViewTransform = iosTranslationLeftEdge();
        bottomViewTransform = CGAffineTransformMakeTranslation(screenWidthDIPs() / 5, 0);
        break;
      }
      default: {
        throw new Error("Unknown direction");
      }
    }

    // Start transform before animation
    topView.transform = isPush ? topViewTransform : CGAffineTransformIdentity;
    topView.layer.masksToBounds = false;
    topView.layer.shadowOffset = CGSizeMake(0, 0);
    topView.layer.shadowOpacity = 0.2;
    topView.layer.shadowRadius = 20;
    topView.layer.shouldRasterize = true;
    topView.layer.rasterizationScale = UIScreen.mainScreen.scale;

    // Shadow 10dip each side of the view
    // topView.layer.shadowPath = UIBezierPath.bezierPathWithRect(CGRectInset(topView.bounds, -10, -10));
    if (this.shiftBottomView) {
      bottomView.transform = isPush ? CGAffineTransformIdentity : bottomViewTransform;
    }
    if (this.fadeBottomView) {
      bottomView.alpha = isPush ? 1 : bottomViewAlphaFaded;
    }

    switch (operation) {
      case UINavigationControllerOperation.Push: {
        containerView.insertSubviewAboveSubview(toView, fromView);
        break;
      }
      case UINavigationControllerOperation.Pop: {
        containerView.insertSubviewBelowSubview(toView, fromView);
        break;
      }
      default: {
        throw new Error("Unknown operation");
      }
    }

    // console.log(`Animation with duration: ${duration}, curve: ${curve}}`);

    UIView.animateWithDurationAnimationsCompletion(duration, () => {
      UIView.setAnimationCurve(curve);
      // UIView.setAnimationCurve(curve);
      // End transform after animation
      topView.transform = isPush ? CGAffineTransformIdentity : topViewTransform;
      if (this.shiftBottomView) {
        bottomView.transform = isPush ? bottomViewTransform : CGAffineTransformIdentity;
      }
      if (this.fadeBottomView) {
        bottomView.alpha = isPush ? bottomViewAlphaFaded : 1;
      }
    }, (finished: boolean) => {
      completion(finished);
    });
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
