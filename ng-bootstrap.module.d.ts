import { ModuleWithProviders } from '@angular/core';
import { TourService } from 'ngx-tour-core';
import { TourAnchorNgBootstrapDirective } from './tour-anchor.directive';
import { TourStepTemplateComponent } from './tour-step-template.component';
export { TourAnchorNgBootstrapDirective, TourStepTemplateComponent, TourService };
export declare class TourNgBootstrapModule {
    static forRoot(): ModuleWithProviders;
}
