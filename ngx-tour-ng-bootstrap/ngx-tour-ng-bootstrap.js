import { CommonModule } from '@angular/common';
import { Component, ComponentFactoryResolver, ContentChild, Directive, ElementRef, HostListener, Injectable, Injector, Input, NgModule, NgZone, Renderer2, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { NavigationStart, Router, RouterModule } from '@angular/router';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/first';
import { map as map$1 } from 'rxjs/operator/map';
import { mergeStatic } from 'rxjs/operator/merge';
import { Subject as Subject$1 } from 'rxjs/Subject';
import { NgbPopover, NgbPopoverConfig, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap/index';
import withinviewport from 'withinviewport';

var TourState = {};
TourState.OFF = 0;
TourState.ON = 1;
TourState.PAUSED = 2;
TourState[TourState.OFF] = "OFF";
TourState[TourState.ON] = "ON";
TourState[TourState.PAUSED] = "PAUSED";
var TourService = /** @class */ (function () {
    /**
     * @param {?} router
     */
    function TourService(router$$1) {
        this.router = router$$1;
        this.stepShow$ = new Subject$1();
        this.stepHide$ = new Subject$1();
        this.initialize$ = new Subject$1();
        this.start$ = new Subject$1();
        this.end$ = new Subject$1();
        this.pause$ = new Subject$1();
        this.resume$ = new Subject$1();
        this.anchorRegister$ = new Subject$1();
        this.anchorUnregister$ = new Subject$1();
        this.events$ = mergeStatic(map$1.bind(this.stepShow$)(function (value) { return ({ name: 'stepShow', value: value }); }), map$1.bind(this.stepHide$)(function (value) { return ({ name: 'stepHide', value: value }); }), map$1.bind(this.initialize$)(function (value) { return ({ name: 'initialize', value: value }); }), map$1.bind(this.start$)(function (value) { return ({ name: 'start', value: value }); }), map$1.bind(this.end$)(function (value) { return ({ name: 'end', value: value }); }), map$1.bind(this.pause$)(function (value) { return ({ name: 'pause', value: value }); }), map$1.bind(this.resume$)(function (value) { return ({ name: 'resume', value: value }); }), map$1.bind(this.anchorRegister$)(function (value) { return ({ name: 'anchorRegister', value: value }); }), map$1.bind(this.anchorUnregister$)(function (value) { return ({ name: 'anchorUnregister', value: value }); }));
        this.steps = [];
        this.anchors = {};
        this.status = TourState.OFF;
    }
    /**
     * @param {?} steps
     * @param {?=} stepDefaults
     * @return {?}
     */
    TourService.prototype.initialize = function (steps, stepDefaults) {
        if (steps && steps.length > 0) {
            this.status = TourState.OFF;
            this.steps = steps.map(function (step) { return Object.assign({}, stepDefaults, step); });
            this.initialize$.next(this.steps);
        }
    };
    /**
     * @return {?}
     */
    TourService.prototype.start = function () {
        this.startAt(0);
    };
    /**
     * @param {?} stepId
     * @return {?}
     */
    TourService.prototype.startAt = function (stepId) {
        var _this = this;
        this.status = TourState.ON;
        this.goToStep(this.loadStep(stepId));
        this.start$.next();
        this.router.events.filter(function (event) { return event instanceof NavigationStart; }).first().subscribe(function () {
            if (_this.currentStep) {
                _this.hideStep(_this.currentStep);
            }
        });
    };
    /**
     * @return {?}
     */
    TourService.prototype.end = function () {
        this.status = TourState.OFF;
        this.hideStep(this.currentStep);
        this.currentStep = undefined;
        this.end$.next();
    };
    /**
     * @return {?}
     */
    TourService.prototype.pause = function () {
        this.status = TourState.PAUSED;
        this.hideStep(this.currentStep);
        this.pause$.next();
    };
    /**
     * @return {?}
     */
    TourService.prototype.resume = function () {
        this.status = TourState.ON;
        this.showStep(this.currentStep);
        this.resume$.next();
    };
    /**
     * @param {?=} pause
     * @return {?}
     */
    TourService.prototype.toggle = function (pause) {
        if (pause) {
            if (this.currentStep) {
                this.pause();
            }
            else {
                this.resume();
            }
        }
        else {
            if (this.currentStep) {
                this.end();
            }
            else {
                this.start();
            }
        }
    };
    /**
     * @return {?}
     */
    TourService.prototype.next = function () {
        if (this.hasNext(this.currentStep)) {
            this.goToStep(this.loadStep(this.currentStep.nextStep || this.steps.indexOf(this.currentStep) + 1));
        }
    };
    /**
     * @param {?} step
     * @return {?}
     */
    TourService.prototype.hasNext = function (step) {
        if (!step) {
            console.warn('Can\'t get next step. No currentStep.');
            return false;
        }
        return step.nextStep !== undefined || this.steps.indexOf(step) < this.steps.length - 1;
    };
    /**
     * @return {?}
     */
    TourService.prototype.prev = function () {
        if (this.hasPrev(this.currentStep)) {
            this.goToStep(this.loadStep(this.currentStep.prevStep || this.steps.indexOf(this.currentStep) - 1));
        }
    };
    /**
     * @param {?} step
     * @return {?}
     */
    TourService.prototype.hasPrev = function (step) {
        if (!step) {
            console.warn('Can\'t get previous step. No currentStep.');
            return false;
        }
        return step.prevStep !== undefined || this.steps.indexOf(step) > 0;
    };
    /**
     * @param {?} stepId
     * @return {?}
     */
    TourService.prototype.goto = function (stepId) {
        this.goToStep(this.loadStep(stepId));
    };
    /**
     * @param {?} anchorId
     * @param {?} anchor
     * @return {?}
     */
    TourService.prototype.register = function (anchorId, anchor) {
        if (this.anchors[anchorId]) {
            throw new Error('anchorId ' + anchorId + ' already registered!');
        }
        this.anchors[anchorId] = anchor;
        this.anchorRegister$.next(anchorId);
    };
    /**
     * @param {?} anchorId
     * @return {?}
     */
    TourService.prototype.unregister = function (anchorId) {
        delete this.anchors[anchorId];
        this.anchorUnregister$.next(anchorId);
    };
    /**
     * @return {?}
     */
    TourService.prototype.getStatus = function () {
        return this.status;
    };
    /**
     * @param {?} step
     * @return {?}
     */
    TourService.prototype.goToStep = function (step) {
        var _this = this;
        if (!step) {
            console.warn('Can\'t go to non-existent step');
            this.end();
            return;
        }
        var /** @type {?} */ navigatePromise = new Promise(function (resolve) { return resolve(true); });
        if (step.route !== undefined && typeof (step.route) === 'string') {
            navigatePromise = this.router.navigateByUrl(step.route);
        }
        else if (step.route && Array.isArray(step.route)) {
            navigatePromise = this.router.navigate(step.route);
        }
        navigatePromise.then(function (navigated) {
            if (navigated !== false) {
                setTimeout(function () { return _this.setCurrentStep(step); });
            }
        });
    };
    /**
     * @param {?} stepId
     * @return {?}
     */
    TourService.prototype.loadStep = function (stepId) {
        if (typeof (stepId) === 'number') {
            return this.steps[stepId];
        }
        else {
            return this.steps.find(function (step) { return step.stepId === stepId; });
        }
    };
    /**
     * @param {?} step
     * @return {?}
     */
    TourService.prototype.setCurrentStep = function (step) {
        var _this = this;
        if (this.currentStep) {
            this.hideStep(this.currentStep);
        }
        this.currentStep = step;
        this.showStep(this.currentStep);
        this.router.events.filter(function (event) { return event instanceof NavigationStart; }).first().subscribe(function () {
            if (_this.currentStep) {
                _this.hideStep(_this.currentStep);
            }
        });
    };
    /**
     * @param {?} step
     * @return {?}
     */
    TourService.prototype.showStep = function (step) {
        var /** @type {?} */ anchor = this.anchors[step && step.anchorId];
        if (!anchor) {
            this.end();
            return;
        }
        anchor.showTourStep(step);
        this.stepShow$.next(step);
    };
    /**
     * @param {?} step
     * @return {?}
     */
    TourService.prototype.hideStep = function (step) {
        var /** @type {?} */ anchor = this.anchors[step && step.anchorId];
        if (!anchor) {
            return;
        }
        anchor.hideTourStep();
        this.stepHide$.next(step);
    };
    return TourService;
}());
TourService.decorators = [
    { type: Injectable },
];
/**
 * @nocollapse
 */
TourService.ctorParameters = function () { return [
    { type: Router, },
]; };
var TourHotkeyListenerComponent = /** @class */ (function () {
    /**
     * @param {?} tourService
     */
    function TourHotkeyListenerComponent(tourService) {
        this.tourService = tourService;
    }
    /**
     * Configures hot keys for controlling the tour with the keyboard
     * @param {?} event
     * @return {?}
     */
    TourHotkeyListenerComponent.prototype.onEscapeKey = function (event) {
        if (this.tourService.getStatus() === TourState.ON) {
            this.tourService.end();
        }
    };
    /**
     * @param {?} event
     * @return {?}
     */
    TourHotkeyListenerComponent.prototype.onArrowRightKey = function (event) {
        if (this.tourService.getStatus() === TourState.ON && this.tourService.hasNext(this.tourService.currentStep)) {
            this.tourService.next();
        }
    };
    /**
     * @param {?} event
     * @return {?}
     */
    TourHotkeyListenerComponent.prototype.onArrowLeftKey = function (event) {
        if (this.tourService.getStatus() === TourState.ON && this.tourService.hasPrev(this.tourService.currentStep)) {
            this.tourService.prev();
        }
    };
    return TourHotkeyListenerComponent;
}());
TourHotkeyListenerComponent.decorators = [
    { type: Component, args: [{
                selector: 'tour-hotkey-listener',
                template: " ",
            },] },
];
/**
 * @nocollapse
 */
TourHotkeyListenerComponent.ctorParameters = function () { return [
    { type: TourService, },
]; };
TourHotkeyListenerComponent.propDecorators = {
    'onEscapeKey': [{ type: HostListener, args: ['window:keydown.Escape',] },],
    'onArrowRightKey': [{ type: HostListener, args: ['window:keydown.ArrowRight',] },],
    'onArrowLeftKey': [{ type: HostListener, args: ['window:keydown.ArrowLeft',] },],
};
var TourModule = /** @class */ (function () {
    function TourModule() {
    }
    /**
     * @return {?}
     */
    TourModule.forRoot = function () {
        return {
            ngModule: TourModule,
            providers: [
                TourService,
            ],
        };
    };
    return TourModule;
}());
TourModule.decorators = [
    { type: NgModule, args: [{
                declarations: [TourHotkeyListenerComponent],
                exports: [TourHotkeyListenerComponent],
                imports: [CommonModule, RouterModule],
            },] },
];
/**
 * @nocollapse
 */
TourModule.ctorParameters = function () { return []; };

class TourStepTemplateService {
}
TourStepTemplateService.decorators = [
    { type: Injectable },
];
/**
 * @nocollapse
 */
TourStepTemplateService.ctorParameters = () => [];

class TourAnchorNgBootstrapDirective extends NgbPopover {
    /**
     * @param {?} tourService
     * @param {?} tourStepTemplate
     * @param {?} _elementRef
     * @param {?} _renderer
     * @param {?} injector
     * @param {?} componentFactoryResolver
     * @param {?} viewContainerRef
     * @param {?} config
     * @param {?} ngZone
     */
    constructor(tourService, tourStepTemplate, _elementRef, _renderer, injector, componentFactoryResolver, viewContainerRef, config, ngZone) {
        super(_elementRef, _renderer, injector, componentFactoryResolver, viewContainerRef, config, ngZone);
        this.tourService = tourService;
        this.tourStepTemplate = tourStepTemplate;
        this.element = _elementRef;
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        this.tourService.register(this.tourAnchor, this);
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        this.tourService.unregister(this.tourAnchor);
    }
    /**
     * @param {?} step
     * @return {?}
     */
    showTourStep(step) {
        this.ngbPopover = this.tourStepTemplate.template;
        this.popoverTitle = step.title;
        this.container = 'body';
        switch (step.placement) {
            case 'above':
                this.placement = 'top';
                break;
            case 'below':
                this.placement = 'bottom';
                break;
            case 'right':
            case 'after':
                this.placement = 'right';
                break;
            case 'left':
            case 'before':
                this.placement = 'left';
                break;
            default:
                this.placement = 'top';
        }
        this.open({ step });
        if (!step.preventScrolling) {
            if (!withinviewport(this.element.nativeElement, { sides: 'bottom' })) {
                ((this.element.nativeElement)).scrollIntoView(false);
            }
            else if (!withinviewport(this.element.nativeElement, { sides: 'left top right' })) {
                ((this.element.nativeElement)).scrollIntoView(true);
            }
        }
    }
    /**
     * @return {?}
     */
    hideTourStep() {
        this.close();
    }
}
TourAnchorNgBootstrapDirective.decorators = [
    { type: Directive, args: [{
                selector: '[tourAnchor]',
            },] },
];
/**
 * @nocollapse
 */
TourAnchorNgBootstrapDirective.ctorParameters = () => [
    { type: TourService, },
    { type: TourStepTemplateService, },
    { type: ElementRef, },
    { type: Renderer2, },
    { type: Injector, },
    { type: ComponentFactoryResolver, },
    { type: ViewContainerRef, },
    { type: NgbPopoverConfig, },
    { type: NgZone, },
];
TourAnchorNgBootstrapDirective.propDecorators = {
    'tourAnchor': [{ type: Input },],
};

class TourStepTemplateComponent extends TourHotkeyListenerComponent {
    /**
     * @param {?} tourStepTemplateService
     * @param {?} tourService
     */
    constructor(tourStepTemplateService, tourService) {
        super(tourService);
        this.tourStepTemplateService = tourStepTemplateService;
        this.tourService = tourService;
    }
    /**
     * @return {?}
     */
    ngAfterContentInit() {
        this.tourStepTemplateService.template = this.stepTemplate || this.defaultTourStepTemplate;
    }
}
TourStepTemplateComponent.decorators = [
    { type: Component, args: [{
                encapsulation: ViewEncapsulation.None,
                selector: 'tour-step-template',
                template: `
    <ng-template #tourStep let-step="step">
      <p class="tour-step-content">{{step?.content}}</p>
      <div class="tour-step-navigation">
        <button *ngIf="tourService.hasPrev(step)" class="btn btn-sm btn-default" (click)="tourService.prev()">« Prev</button>
        <button *ngIf="tourService.hasNext(step)" class="btn btn-sm btn-default" (click)="tourService.next()">Next »</button>
        <button class="btn btn-sm btn-default" (click)="tourService.end()">End</button>
      </div>
    </ng-template>
  `,
            },] },
];
/**
 * @nocollapse
 */
TourStepTemplateComponent.ctorParameters = () => [
    { type: TourStepTemplateService, },
    { type: TourService, },
];
TourStepTemplateComponent.propDecorators = {
    'defaultTourStepTemplate': [{ type: ViewChild, args: ['tourStep', { read: TemplateRef },] },],
    'stepTemplate': [{ type: Input }, { type: ContentChild, args: [TemplateRef,] },],
};

class TourNgBootstrapModule {
    /**
     * @return {?}
     */
    static forRoot() {
        return {
            ngModule: TourNgBootstrapModule,
            providers: [
                TourStepTemplateService,
                ...TourModule.forRoot().providers,
            ],
        };
    }
}
TourNgBootstrapModule.decorators = [
    { type: NgModule, args: [{
                declarations: [TourAnchorNgBootstrapDirective, TourStepTemplateComponent],
                exports: [TourAnchorNgBootstrapDirective, TourStepTemplateComponent],
                imports: [CommonModule, NgbPopoverModule.forRoot()],
            },] },
];
/**
 * @nocollapse
 */
TourNgBootstrapModule.ctorParameters = () => [];

/**
 * Generated bundle index. Do not edit.
 */

export { TourNgBootstrapModule, TourAnchorNgBootstrapDirective, TourStepTemplateComponent, TourModule, TourService, TourState, TourHotkeyListenerComponent, TourStepTemplateService as ɵa };
//# sourceMappingURL=ngx-tour-ng-bootstrap.js.map
