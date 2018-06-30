package org.wise.portal.presentation.web.controllers.teacher;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.project.ProjectService;
import org.wise.portal.service.run.RunService;

import java.util.HashMap;
import java.util.List;
import java.util.Properties;

/**
 * Controller for Teacher REST API
 *
 * @author Jonathan Lim-Breitbart
 * @author Geoffrey Kwan
 * @author Hiroki Terashima
 */
@RestController
@RequestMapping("/site/api/teacher")
public class TeacherAPIController {

  @Autowired
  private Properties wiseProperties;

  @Autowired
  private ProjectService projectService;

  @Autowired
  private RunService runService;

  @RequestMapping(value = "/config", method = RequestMethod.GET)
  protected String getConfig(ModelMap modelMap) throws JSONException {
    JSONObject configJSON = new JSONObject();
    configJSON.put("logOutURL", wiseProperties.get("wiseBaseURL") + "/logout");
    return configJSON.toString();
  }

  @RequestMapping(value = "/projects", method = RequestMethod.GET)
  protected String getProjects(ModelMap modelMap) throws JSONException {
    User user = ControllerUtil.getSignedInUser();
    List<Run> runs = runService.getRunListByOwner(user);
    HashMap<Long, Run> runMap = new HashMap<>();
    for (Run run : runs) {
      runMap.put((Long) run.getProject().getId(), run);
    }
    List<Project> projects = projectService.getProjectList(user);
    JSONArray projectsArray = new JSONArray();
    for (Project project : projects) {
      Run projectRun = runMap.get(project.getId());
      projectsArray.put(getProjectJSON(project, projectRun));
    }
    return projectsArray.toString();
  }

  private JSONObject getProjectJSON(Project project, Run projectRun) throws JSONException {
    JSONObject projectJSON = new JSONObject();
    projectJSON.put("id", project.getId());
    projectJSON.put("name", project.getName());
    projectJSON.put("dateCreated", project.getDateCreated());
    projectJSON.put("dateArchived", project.getDateDeleted());
    if (projectRun != null) {
      JSONObject runJSON = new JSONObject();
      runJSON.put("id", projectRun.getId());
      runJSON.put("name", projectRun.getName());
      runJSON.put("runCode", projectRun.getRuncode());
      runJSON.put("startTime", projectRun.getStarttime());
      runJSON.put("endTime", projectRun.getEndtime());
      runJSON.put("teacherFirstName", projectRun.getOwner().getUserDetails().getFirstname());
      runJSON.put("teacherLastName", projectRun.getOwner().getUserDetails().getLastname());
      runJSON.put("teacherDisplayName",
        ((TeacherUserDetails) projectRun.getOwner().getUserDetails()).getDisplayname());
      projectJSON.put("run", runJSON);
    }
    return projectJSON;
  }

}
