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
    subscribeOn,
} from 'rxjs/operators';

import { interval, timer } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { getLocaleDateTimeFormat } from '@angular/common';
import { O_NOFOLLOW } from 'constants';

type ProcessIdToAlias = Record<string, string>;
//type ProcessIdToAlias = { key: string, name: string}
//type ProcessIdToSchedule = Record<string, CronJob>;
//type ProcessIdToSchedule = { key: string, cron: CronJob}
type ScheduleEnablement = Record<string, boolean>;
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
  //private minutes = interval(60000);
  private timer = undefined;
  private store: PersistentStore<ScheduleEnablement>;
  private clickSchedule:boolean;
  public scheduleStatus = new BehaviorSubject<ScheduleEnablement>({});

  constructor(
    private robotService: RobotService,
    private dialogService: DialogService,
    storageFactory: PersistentStoreFactory,
    appState: WidgetAppState,
  ) {
    this.clickSchedule = false;
    appState.language$.subscribe(console.log);
    appState.theme$.subscribe(console.log);
    this.store = storageFactory.create<ScheduleEnablement>('SCHEDULE_STATUS'); // TODO: change key
    this.refreshStatus();
    const onetimer = timer(1000).subscribe( val => this.enableCheckbox())
  }

  public enableCheckbox( ) {
    if( this.clickSchedule)
    {
      let elm = document.getElementById('mat-checkbox-1'); // TODO: unique 한지 체크해봐야 함.
      elm.classList.add("mat-checkbox-checked");
      this.timer = timer(10000);
      this.timer.subscribe( val => this.checkSchedule(val))
    }
  }

  public refreshStatus() {
    this.store.read().subscribe(mapping => this.scheduleStatus.next(mapping || {}));
    this.scheduleStatus.subscribe( val => {
      if( val.hasOwnProperty('enable'))
        this.clickSchedule = val['enable'];
    });
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
          if( btn.getAttribute("data-testid") == 'reminder-action-yes') {
            let running = Array.prototype.slice.call(document.getElementsByTagName("ui-running-process-widget"));
            let runButtons = Array.prototype.slice.call( running[0].getElementsByTagName("button"));
            if( runButtons.length == 1) {// no running process
              console.log('start process...');
              btn.click();
            }
            else
            {
              console.log('already process is running, wait until current process exits');
            }
          }
        });
      });
      this.timer = timer(10000);
      this.timer.subscribe( val => this.checkSchedule(val));
    }
  }
  public updateStatus( evt)
  {
    if ( evt.checked)
    {
      this.clickSchedule = true;
      this.timer = timer(10000);
      this.timer.subscribe( val => this.checkSchedule(val));
      console.log('just starck check schedule....');
      this.store.patch( { "enable": true}).subscribe( () => this.refreshStatus(),);
    }
    else
    {
      this.clickSchedule = false;
      console.log('just stop check schedule....');
      this.store.patch( { "enable" : false}).subscribe( () => this.refreshStatus(),);
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
