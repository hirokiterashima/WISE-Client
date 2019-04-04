package org.wise.vle.web.wise5;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.acls.domain.BasePermission;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
//import org.springframework.web.socket.WebSocketHandler;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.authentication.impl.StudentUserDetails;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.vle.wise5.VLEService;
import org.wise.portal.service.workgroup.WorkgroupService;
import org.wise.vle.domain.notification.Notification;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

/**
 * Controller for handling GET and POST of WISE5 Notifications
 * @author Hiroki Terashima
 */
@Controller
public class NotificationController {

  @Autowired
  private VLEService vleService;

  @Autowired
  private RunService runService;

//  @Autowired
//  private WebSocketHandler webSocketHandler;

  @Autowired
  private WorkgroupService workgroupService;

  @RequestMapping(method = RequestMethod.GET, value = "/notification/{runId}")
  protected void getNotifications(
      @PathVariable Integer runId,
      @RequestParam(value = "id", required = false) Integer id,
      @RequestParam(value = "periodId", required = false) Integer periodId,
      @RequestParam(value = "toWorkgroupId", required = false) Integer toWorkgroupId,
      @RequestParam(value = "groupId", required = false) String groupId,
      @RequestParam(value = "nodeId", required = false) String nodeId,
      @RequestParam(value = "componentId", required = false) String componentId,
      HttpServletResponse response) throws IOException {
    User signedInUser = ControllerUtil.getSignedInUser();
    try {
      Run run = runService.retrieveById(new Long(runId));
      if (toWorkgroupId != null) {
        Workgroup workgroup = workgroupService.retrieveById(new Long(toWorkgroupId));
        if (signedInUser.getUserDetails() instanceof StudentUserDetails &&
            (!run.isStudentAssociatedToThisRun(signedInUser) ||
            !workgroup.getMembers().contains(signedInUser))) {
          return;
        }
      } else if (!signedInUser.isAdmin() &&
          !runService.hasRunPermission(run, signedInUser, BasePermission.READ)) {
        return;
      }
      List<Notification> notificationList = vleService.getNotifications(id, runId, periodId,
          toWorkgroupId, groupId, nodeId, componentId);
      JSONArray notifications = new JSONArray();
      for (Notification notification : notificationList) {
        notifications.put(notification.toJSON());
      }
      response.getWriter().write(notifications.toString());
    } catch (ObjectNotFoundException e) {
      e.printStackTrace();
      return;
    }
  }

  @RequestMapping(method = RequestMethod.POST, value = "/notification/{runId}")
  protected void postNotification(
      @PathVariable Integer runId,
      @RequestParam(value = "notificationId", required = false) Integer notificationId,
      @RequestParam(value = "periodId", required = true) Integer periodId,
      @RequestParam(value = "fromWorkgroupId", required = false) Integer fromWorkgroupId,
      @RequestParam(value = "toWorkgroupId", required = false) Integer toWorkgroupId,
      @RequestParam(value = "groupId", required = false) String groupId,
      @RequestParam(value = "nodeId", required = false) String nodeId,
      @RequestParam(value = "componentId", required = false) String componentId,
      @RequestParam(value = "componentType", required = false) String componentType,
      @RequestParam(value = "type", required = false) String type,
      @RequestParam(value = "message", required = false) String message,
      @RequestParam(value = "data", required = false) String data,
      @RequestParam(value = "timeGenerated", required = true) String timeGenerated,
      @RequestParam(value = "timeDismissed", required = false) String timeDismissed,
      HttpServletResponse response) throws IOException {
    User signedInUser = ControllerUtil.getSignedInUser();
    try {
      Run run = runService.retrieveById(new Long(runId));
      if (signedInUser.isAdmin() ||
          runService.hasRunPermission(run, signedInUser, BasePermission.READ)) {
      } else if (notificationId != null) {
        Notification notification = vleService.getNotificationById(notificationId);
        if (notification == null ||
            !notification.getToWorkgroup().getMembers().contains(signedInUser)) {
          return;
        }
      } else if (fromWorkgroupId != null) {
        Workgroup fromWorkgroup = workgroupService.retrieveById(new Long(fromWorkgroupId));
        if (signedInUser.getUserDetails() instanceof StudentUserDetails &&
            (!run.isStudentAssociatedToThisRun(signedInUser) ||
            !fromWorkgroup.getMembers().contains(signedInUser))) {
          return;
        }
      } else if (toWorkgroupId != null) {
        if (fromWorkgroupId == null) {
          if ("CRaterResult".equals(type)) {
          } else {
            return;
          }
        } else {
          Workgroup fromWorkgroup = workgroupService.retrieveById(new Long(fromWorkgroupId));
          if (signedInUser.getUserDetails() instanceof StudentUserDetails &&
              (!run.isStudentAssociatedToThisRun(signedInUser) ||
              !fromWorkgroup.getMembers().contains(signedInUser))) {
            return;
          }
        }
      }
    } catch (ObjectNotFoundException e) {
      e.printStackTrace();
      return;
    }

    Notification notification = vleService.saveNotification(
        notificationId,
        runId,
        periodId,
        fromWorkgroupId,
        toWorkgroupId,
        groupId,
        nodeId,
        componentId,
        componentType,
        type,
        message,
        data,
        timeGenerated,
        timeDismissed);
    response.getWriter().write(notification.toJSON().toString());
  }

  @RequestMapping(method = RequestMethod.POST, value = "/notification/{runId}/dismiss")
  protected void dismissNotification(
      @PathVariable Integer runId,
      @RequestParam(value = "notificationId", required = true) Integer notificationId,
      @RequestParam(value = "periodId", required = false) Integer periodId,
      @RequestParam(value = "type", required = true) String type,
      @RequestParam(value = "fromWorkgroupId", required = false) Integer fromWorkgroupId,
      @RequestParam(value = "toWorkgroupId", required = false) Integer toWorkgroupId,
      @RequestParam(value = "groupId", required = false) String groupId,
      @RequestParam(value = "timeDismissed", required = false) String timeDismissed,
      HttpServletResponse response) throws IOException {
    User signedInUser = ControllerUtil.getSignedInUser();
    try {
      Notification notification = vleService.getNotificationById(notificationId);
      Run run = runService.retrieveById(new Long(runId));
      if (signedInUser.isAdmin() ||
          runService.hasRunPermission(run, signedInUser, BasePermission.READ) ||
          !notification.getToWorkgroup().getMembers().contains(signedInUser)) {
      }
      notification = vleService.dismissNotification(notification, timeDismissed);
      if (groupId != null && "CRaterResult".equals(type)) {
        List<Notification> notificationsInGroup = vleService.getNotificationsByGroupId(groupId);
        for (Notification notificationInGroup : notificationsInGroup) {
          if (notificationInGroup.getId().equals(notification.getId())) {
            continue;
          }
          vleService.dismissNotification(notificationInGroup, timeDismissed);
          try {
//            if (webSocketHandler != null) {
//              WISEWebSocketHandler wiseWebSocketHandler = (WISEWebSocketHandler) webSocketHandler;
//              if (wiseWebSocketHandler != null) {
//                String messageParticipants = "";
//                if (notificationInGroup.getToWorkgroup().isTeacherWorkgroup()) {
//                  messageParticipants = "studentToTeachers";
//                } else {
//                  messageParticipants = "teacherToStudentsInRun";
//                }
//                JSONObject notificationJSON = notificationInGroup.toJSON();
//                JSONObject webSocketMessageJSON = new JSONObject();
//                webSocketMessageJSON.put("messageType", "notification");
//                webSocketMessageJSON.put("messageParticipants", messageParticipants);
//                webSocketMessageJSON.put("toWorkgroupId", notificationInGroup.getToWorkgroup().getId());
//                webSocketMessageJSON.put("data", notificationJSON);
//                wiseWebSocketHandler.handleMessage(signedInUser, webSocketMessageJSON.toString());
//              }
//            }
          } catch (Exception e) {
          }
        }
      }
      response.getWriter().write(notification.toJSON().toString());
    } catch (ObjectNotFoundException e) {
      e.printStackTrace();
      return;
    }
  }
}
