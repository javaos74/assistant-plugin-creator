import { trigger } from '@angular/animations';
import {
    ChangeDetectionStrategy,
    Component,
    ViewEncapsulation,
} from '@angular/core';
import {
    ActionType,
    CollapseState,
    collapseVariableHeight,
    DialogService,
    PersistentStore,
    PersistentStoreFactory,
    ProcessAction,
    RobotService,
    rotate180Animation,
    rotate360Animation,
    RotateState,
    WidgetAppState,
} from '@uipath/widget.sdk';

import { BehaviorSubject } from 'rxjs';
import {
    filter,
    switchMapTo,
} from 'rxjs/operators';

import { interval } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { getLocaleDateTimeFormat } from '@angular/common';
import { O_NOFOLLOW } from 'constants';

type ProcessIdToAlias = Record<string, string>;
//type ProcessIdToAlias = { key: string, name: string}
//type ProcessIdToSchedule = Record<string, CronJob>;
//type ProcessIdToSchedule = { key: string, cron: CronJob}
type ScheduleEnablement = {key: string, status: boolean}
@Component({
  selector: 'sample-widget',
  templateUrl: './sample-widget.component.html',
  styleUrls: ['./sample-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('collapse', collapseVariableHeight()),
    trigger('rotate180', rotate180Animation()),
    trigger('rotate360', rotate360Animation()),
  ],
  encapsulation: ViewEncapsulation.None,
})
export class SampleWidgetComponent {
  public RotateState = RotateState;
  public CollapseState = CollapseState;
  public isCollapsed = false;
  private processSchedule = {};
  private minutes = interval(30000);
  private store: PersistentStore<ScheduleEnablement>;
  private schedule : PersistentStore<{}>;
  private clickSchedule:boolean;

  constructor(
    private robotService: RobotService,
    private dialogService: DialogService,
    storageFactory: PersistentStoreFactory,
    appState: WidgetAppState,
  ) {
    appState.language$.subscribe(console.log);
    appState.theme$.subscribe(console.log);
    this.store = storageFactory.create<ScheduleEnablement>('STATUS'); // TODO: change key
    //this.schedule = storageFactory.create<{}>("SCHEDULE_WIDGET_DATA");
    this.minutes.pipe( timeout( new Date( new Date().getFullYear()+1, 1, 1))).subscribe( value => this.checkSchedule(value))

    //this.schedule.read().subscribe( value => console.log(value));
  }

  public checkSchedule( val)
  {
    console.log(val)
    if( this.clickSchedule)
    {
      let reminders = Array.prototype.slice.call( document.getElementsByClassName("reminder-action"));
      reminders.forEach( elm => {
        let btns = Array.prototype.slice.call( elm.getElementsByTagName("button"));
        btns.forEach( btn => {
          if( btn.getAttribute("data-testid") == 'reminder-action-yes')
          {
            console.log('start process...');
            btn.click();
          }
        });
      });
    }
  }
  public updateStatus( evt)
  {
    if ( evt.checked)
    {
      this.clickSchedule = true;
      this.schedule.read().subscribe( value => console.log(value));
      console.log('just starck check schedule....');
      this.store.patch( { key: "enable", status: true});
    }
    else
    {
      this.clickSchedule = false;
      console.log('just stop check schedule....');
      this.store.patch( { key: "enable", status: false});
    }
  }

  public async actionHandler({ actionType, processKey, source }: ProcessAction) {
    switch (actionType) {
      case ActionType.Start:
        return await this.robotService.startJob({ processKey }).toPromise();
      case ActionType.Stop:
        return await this.dialogService
          .confirmation({
            isDestructive: true,
            message: 'Are you sure you want to stop this process?',
            title: 'Stopping all processes',
            translateData: source,
          })
          .afterClosedResult()
          .pipe(
            filter(result => !!result),
            switchMapTo(this.robotService.stopProcess(processKey)),
          ).toPromise();
      case ActionType.Resume:
        return await this.robotService.resumeProcess(processKey).toPromise();
      case ActionType.Pause:
        return await this.robotService.pauseProcess(processKey).toPromise();
      case ActionType.Install:
        return await this.robotService.installProcess({ processKey }).toPromise();
    }
  }
}
