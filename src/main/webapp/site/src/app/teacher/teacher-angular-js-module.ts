
import { Component, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import teacher from '../../../../wise5/teacher/teacher';
import { UpgradeModule } from '@angular/upgrade/static';
import { setUpLocationSync } from '@angular/router/upgrade';
import { UtilService } from '../../../../wise5/services/utilService';
import { ConfigService } from '../../../../wise5/services/configService';
import { ProjectService } from '../../../../wise5/services/projectService';
import { ClassroomMonitorProjectService } from '../../../../wise5/classroomMonitor/classroomMonitorProjectService';
import { MilestoneReportDataComponent } from './milestone/milestone-report-data/milestone-report-data.component';
import { CRaterService } from '../../../../wise5/services/cRaterService';
import { StudentAssetService } from '../../../../wise5/services/studentAssetService';
import { ProjectAssetService } from '../services/projectAssetService';

@Component({template: ``})
export class EmptyComponent {}

@NgModule({
  declarations: [
    EmptyComponent,
    MilestoneReportDataComponent
  ],
  imports: [
    UpgradeModule,
    RouterModule.forChild([
      {path: '**', component: EmptyComponent}
    ])
  ],
  providers: [
    UtilService,
    ConfigService,
    CRaterService,
    ProjectAssetService,
    ClassroomMonitorProjectService,
    { provide: ProjectService, useExisting: ClassroomMonitorProjectService },
    StudentAssetService
  ],
  entryComponents: [
    MilestoneReportDataComponent
  ]
})
export class TeacherAngularJSModule {
  // The constructor is called only once, so we bootstrap the application
  // only once, when we first navigate to the legacy part of the app.
  constructor(upgrade: UpgradeModule) {
    upgrade.bootstrap(document.body, [teacher.name]);
    setUpLocationSync(upgrade);
  }
}
