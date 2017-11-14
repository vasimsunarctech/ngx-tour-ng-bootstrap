import { ComponentFactoryResolver, ElementRef, Injector, NgZone, OnDestroy, OnInit, Renderer2, ViewContainerRef } from '@angular/core';
import { NgbPopoverConfig, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { IStepOption, TourAnchorDirective, TourService } from 'ngx-tour-core';
import { TourStepTemplateService } from './tour-step-template.service';
export declare class TourAnchorNgBootstrapDirective extends NgbPopover implements OnInit, OnDestroy, TourAnchorDirective {
    private tourService;
    private tourStepTemplate;
    tourAnchor: string;
    private element;
    constructor(tourService: TourService, tourStepTemplate: TourStepTemplateService, _elementRef: ElementRef, _renderer: Renderer2, injector: Injector, componentFactoryResolver: ComponentFactoryResolver, viewContainerRef: ViewContainerRef, config: NgbPopoverConfig, ngZone: NgZone);
    ngOnInit(): void;
    ngOnDestroy(): void;
    showTourStep(step: IStepOption): void;
    hideTourStep(): void;
}
