import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
    FormatDistanceModule,
    TitleBarComponentModule,
    WidgetItemModule,
} from '@uipath/widget.sdk';

import { MainComponent } from './main.component';
import { SampleWidgetComponent } from './sample-widget.component';

@NgModule({
  declarations: [
    SampleWidgetComponent,
    MainComponent
  ],
  imports: [
    TitleBarComponentModule,
    WidgetItemModule,
    FormatDistanceModule,
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDividerModule,
    MatListModule,
    MatProgressBarModule,
    ScrollingModule,
    MatTooltipModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  exports: [MainComponent]
})
export class SampleWidgetModule { }
