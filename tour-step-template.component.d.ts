import { TourService, TourHotkeyListenerComponent, IStepOption } from 'ngx-tour-core';
import { TourStepTemplateService } from './tour-step-template.service';
import { TemplateRef, AfterContentInit } from '@angular/core';
export declare class TourStepTemplateComponent extends TourHotkeyListenerComponent implements AfterContentInit {
    private tourStepTemplateService;
    tourService: TourService;
    defaultTourStepTemplate: TemplateRef<any>;
    stepTemplate: TemplateRef<{
        step: IStepOption;
    }>;
    constructor(tourStepTemplateService: TourStepTemplateService, tourService: TourService);
    ngAfterContentInit(): void;
}
