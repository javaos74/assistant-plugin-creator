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
  private minutes = interval(60000);
  private store: PersistentStore<ScheduleEnablement>;

  constructor(
    private robotService: RobotService,
    private dialogService: DialogService,
    storageFactory: PersistentStoreFactory,
    appState: WidgetAppState,
  ) {
    appState.language$.subscribe(console.log);
    appState.theme$.subscribe(console.log);
    this.store = storageFactory.create<ScheduleEnablement>('STATUS'); // TODO: change key
    storageFactory.create<{}>("")
    this.minutes.pipe( timeout( new Date( new Date().getFullYear()+1, 1, 1))).subscribe( value => this.checkSchedule(value))
  }

  public checkSchedule( val)
  {

  }
  public updateStatus( evt)
  {
    if ( evt.checked)
    {
      console.log('just starck check schedule....');
      this.store.update( { key: "enable", status: true});
    }
    else
    {
      this.store.update( { key: "enable", status: false});
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
