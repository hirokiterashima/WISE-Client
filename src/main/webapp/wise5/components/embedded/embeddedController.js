'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _iframeResizer = require('iframe-resizer');

var _iframeResizer2 = _interopRequireDefault(_iframeResizer);

var _html2canvas = require('html2canvas');

var _html2canvas2 = _interopRequireDefault(_html2canvas);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EmbeddedController = function () {
  function EmbeddedController($filter, $injector, $mdDialog, $q, $rootScope, $scope, $sce, $timeout, $window, AnnotationService, ConfigService, NodeService, NotebookService, EmbeddedService, ProjectService, StudentDataService, UtilService) {
    var _this = this;

    _classCallCheck(this, EmbeddedController);

    this.$filter = $filter;
    this.$injector = $injector;
    this.$mdDialog = $mdDialog;
    this.$q = $q;
    this.$rootScope = $rootScope;
    this.$scope = $scope;
    this.$sce = $sce;
    this.$timeout = $timeout;
    this.$window = $window;
    this.AnnotationService = AnnotationService;
    this.ConfigService = ConfigService;
    this.NodeService = NodeService;
    this.NotebookService = NotebookService;
    this.EmbeddedService = EmbeddedService;
    this.ProjectService = ProjectService;
    this.StudentDataService = StudentDataService;
    this.UtilService = UtilService;
    this.idToOrder = this.ProjectService.idToOrder;
    this.$translate = this.$filter('translate');
    this.nodeId = null;
    this.componentId = null;
    this.componentContent = null;
    this.authoringComponentContent = null;
    this.componentType = null;
    this.url = null;

    // the width of the iframe (optional)
    this.width = null;

    // the height of the iframe (optional)
    this.height = null;

    // the max width of the iframe
    this.maxWidth = null;

    // the max height of the iframe
    this.maxHeight = null;

    this.isDirty = false;
    this.isSubmitDirty = false;
    this.isSnipModelButtonVisible = true;
    this.notebookConfig = this.NotebookService.getNotebookConfig();

    this.saveMessage = {
      text: '',
      time: ''
    };

    this.latestAnnotations = null;
    this.componentStateId = null;
    this.embeddedApplicationIFrameId = '';
    this.isSaveButtonVisible = false;
    this.isSubmitButtonVisible = false;
    this.showAdvancedAuthoring = false;
    this.showJSONAuthoring = false;

    this.connectedComponentUpdateOnOptions = [{
      value: 'change',
      text: 'Change'
    }, {
      value: 'submit',
      text: 'Submit'
    }];

    this.allowedConnectedComponentTypes = [{ type: 'Animation' }, { type: 'AudioOscillator' }, { type: 'ConceptMap' }, { type: 'Discussion' }, { type: 'Draw' }, { type: 'Embedded' }, { type: 'Graph' }, { type: 'Label' }, { type: 'Match' }, { type: 'MultipleChoice' }, { type: 'OpenResponse' }, { type: 'Table' }];

    this.nodeId = this.$scope.nodeId;

    this.componentContent = this.$scope.componentContent;
    this.authoringComponentContent = this.$scope.authoringComponentContent;

    /*
     * get the original component content. this is used when showing
     * previous work from another component.
     */
    this.originalComponentContent = this.$scope.originalComponentContent;

    // the mode to load the component in e.g. 'student', 'grading', 'onlyShowWork'
    this.mode = this.$scope.mode;

    this.workgroupId = this.$scope.workgroupId;
    this.teacherWorkgroupId = this.$scope.teacherWorkgroupId;

    if (this.componentContent != null) {
      this.componentId = this.componentContent.id;
      this.embeddedApplicationIFrameId = 'componentApp_' + this.componentId;
      this.componentType = this.componentContent.type;

      if (this.mode === 'student') {
        this.isSaveButtonVisible = this.componentContent.showSaveButton;
        this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
        this.latestAnnotations = this.AnnotationService.getLatestComponentAnnotations(this.nodeId, this.componentId, this.workgroupId);
        this.isSnipModelButtonVisible = true;
      } else if (this.mode === 'authoring') {
        this.summernoteRubricId = 'summernoteRubric_' + this.nodeId + '_' + this.componentId;
        this.summernoteRubricHTML = this.componentContent.rubric;

        // the tooltip text for the insert WISE asset button
        var insertAssetString = this.$translate('INSERT_ASSET');

        // create the custom button for inserting WISE assets into summernote
        var InsertAssetButton = this.UtilService.createInsertAssetButton(this, null, this.nodeId, this.componentId, 'rubric', insertAssetString);

        this.summernoteRubricOptions = {
          toolbar: [['style', ['style']], ['font', ['bold', 'underline', 'clear']], ['fontname', ['fontname']], ['fontsize', ['fontsize']], ['color', ['color']], ['para', ['ul', 'ol', 'paragraph']], ['table', ['table']], ['insert', ['link', 'video']], ['view', ['fullscreen', 'codeview', 'help']], ['customButton', ['insertAssetButton']]],
          height: 300,
          disableDragAndDrop: true,
          buttons: {
            insertAssetButton: InsertAssetButton
          }
        };

        this.updateAdvancedAuthoringView();

        $scope.$watch(function () {
          return this.authoringComponentContent;
        }.bind(this), function (newValue, oldValue) {
          this.componentContent = this.ProjectService.injectAssetPaths(newValue);
          this.isSaveButtonVisible = this.componentContent.showSaveButton;
          this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
          this.width = this.componentContent.width ? this.componentContent.width : '100%';
          this.height = this.componentContent.height ? this.componentContent.height : '100%';
          this.setURL(this.componentContent.url);
        }.bind(this), true);
      } else if (this.mode === 'grading' || this.mode === 'gradingRevision') {
        this.isSaveButtonVisible = false;
        this.isSubmitButtonVisible = false;
        this.isSnipModelButtonVisible = false;
        var componentState = this.$scope.componentState;
        if (componentState != null) {
          // create a unique id for the application iframe using this component state
          this.embeddedApplicationIFrameId = 'componentApp_' + componentState.id;
          if (this.mode === 'gradingRevision') {
            this.embeddedApplicationIFrameId = 'componentApp_gradingRevision_' + componentState.id;
          }
        }

        if (this.mode === 'grading') {
          this.latestAnnotations = this.AnnotationService.getLatestComponentAnnotations(this.nodeId, this.componentId, this.workgroupId);
        }
      } else if (this.mode === 'onlyShowWork') {
        this.isSaveButtonVisible = false;
        this.isSubmitButtonVisible = false;
        this.isSnipModelButtonVisible = false;
      } else if (this.mode === 'showPreviousWork') {
        this.isSaveButtonVisible = false;
        this.isSubmitButtonVisible = false;
        this.isSnipModelButtonVisible = false;
      }

      if (this.componentContent != null) {
        this.setURL(this.componentContent.url);
      }

      this.width = this.componentContent.width ? this.componentContent.width : '100%';
      this.height = this.componentContent.height ? this.componentContent.height : '100%';

      if (this.$scope.$parent.nodeController != null) {
        this.$scope.$parent.nodeController.registerComponentController(this.$scope, this.componentContent);
      }

      this.$rootScope.$broadcast('doneRenderingComponent', { nodeId: this.$scope.nodeId, componentId: this.componentId });
    }

    /**
     * A connected component has changed its student data so we will
     * perform any necessary changes to this component
     * @param connectedComponent the connected component
     * @param connectedComponentParams the connected component params
     * @param componentState the student data from the connected
     * component that has changed
     */
    this.$scope.handleConnectedComponentStudentDataChanged = function (connectedComponent, connectedComponentParams, componentState) {
      var message = {};
      message.messageType = 'handleConnectedComponentStudentDataChanged';
      message.componentState = componentState;
      _this.sendMessageToApplication(message);
    };

    this.$scope.$on('nodeSubmitClicked', function (event, args) {
      var nodeId = args.nodeId;
      if (_this.nodeId === nodeId) {
        _this.isSubmit = true;
      }
    });

    this.$scope.$on('studentWorkSavedToServer', function (event, args) {
      var componentState = args.studentWork;
      if (componentState != null) {
        if (componentState.componentId === _this.componentId) {
          // set isDirty to false because the component state was just saved and notify node
          _this.isDirty = false;
          _this.$scope.$emit('componentDirty', { componentId: _this.componentId, isDirty: false });
          _this.$scope.embeddedController.componentState = null;

          var isAutoSave = componentState.isAutoSave;
          var isSubmit = componentState.isSubmit;
          var serverSaveTime = componentState.serverSaveTime;
          var clientSaveTime = _this.ConfigService.convertToClientTimestamp(serverSaveTime);

          if (isSubmit) {
            _this.setSaveMessage(_this.$translate('SUBMITTED'), clientSaveTime);
            _this.submit();
            _this.isSubmitDirty = false;
            _this.$scope.$emit('componentSubmitDirty', { componentId: _this.componentId, isDirty: false });
          } else if (isAutoSave) {
            _this.setSaveMessage(_this.$translate('AUTO_SAVED'), clientSaveTime);
          } else {
            _this.setSaveMessage(_this.$translate('SAVED'), clientSaveTime);
          }

          var message = {};
          message.messageType = 'componentStateSaved';
          message.componentState = componentState;
          _this.sendMessageToApplication(message);
        }
      }
    });

    /**
     * Get the component state from this component. The parent node will
     * call this function to obtain the component state when it needs to
     * save student data.
     * @param isSubmit boolean whether the request is coming from a submit
     * action (optional; default is false)
     * @return a promise of a component state containing the student data
     */
    this.$scope.getComponentState = function (isSubmit) {
      var deferred = this.$q.defer();
      var getState = false;
      var action = 'change';

      if (isSubmit) {
        if (this.$scope.embeddedController.isSubmitDirty) {
          getState = true;
          action = 'submit';
        }
      } else {
        if (this.$scope.embeddedController.isDirty) {
          getState = true;
          action = 'save';
        }
      }

      if (getState) {
        this.$scope.embeddedController.createComponentState(action).then(function (componentState) {
          deferred.resolve(componentState);
        });
      } else {
        /*
         * the student does not have any unsaved changes in this component
         * so we don't need to save a component state for this component.
         * we will immediately resolve the promise here.
         */
        deferred.resolve();
      }

      return deferred.promise;
    }.bind(this);

    /**
     * Listen for the 'annotationSavedToServer' event which is fired when
     * we receive the response from saving an annotation to the server
     */
    this.$scope.$on('annotationSavedToServer', function (event, args) {
      if (args != null) {
        var annotation = args.annotation;
        if (annotation != null) {
          var annotationNodeId = annotation.nodeId;
          var annotationComponentId = annotation.componentId;
          if (_this.nodeId === annotationNodeId && _this.componentId === annotationComponentId) {
            _this.latestAnnotations = _this.AnnotationService.getLatestComponentAnnotations(_this.nodeId, _this.componentId, _this.workgroupId);
          }
        }
      }
    });

    /**
     * Listen for the 'exitNode' event which is fired when the student
     * exits the parent node. This will perform any necessary cleanup
     * when the student exits the parent node.
     */
    this.$scope.$on('exitNode', angular.bind(this, function (event, args) {
      this.$window.removeEventListener('message', this.messageEventListener);
    }));

    /*
     * Listen for the assetSelected event which occurs when the user
     * selects an asset from the choose asset popup
     */
    this.$scope.$on('assetSelected', function (event, args) {
      if (args != null) {
        if (args.nodeId == _this.nodeId && args.componentId == _this.componentId) {
          var assetItem = args.assetItem;
          if (assetItem != null) {
            var fileName = assetItem.fileName;
            if (fileName != null) {
              // get the assets directory path, e.g. /wise/curriculum/3/
              var assetsDirectoryPath = _this.ConfigService.getProjectAssetsDirectoryPath();
              var fullAssetPath = assetsDirectoryPath + '/' + fileName;
              var summernoteId = '';

              if (args.target == 'prompt') {
                summernoteId = 'summernotePrompt_' + _this.nodeId + '_' + _this.componentId;
              } else if (args.target == 'rubric') {
                summernoteId = 'summernoteRubric_' + _this.nodeId + '_' + _this.componentId;
              }

              if (summernoteId != '') {
                if (_this.UtilService.isImage(fileName)) {
                  /*
                   * move the cursor back to its position when the asset chooser
                   * popup was clicked
                   */
                  $('#' + summernoteId).summernote('editor.restoreRange');
                  $('#' + summernoteId).summernote('editor.focus');
                  $('#' + summernoteId).summernote('insertImage', fullAssetPath, fileName);
                } else if (_this.UtilService.isVideo(fileName)) {
                  /*
                   * move the cursor back to its position when the asset chooser
                   * popup was clicked
                   */
                  $('#' + summernoteId).summernote('editor.restoreRange');
                  $('#' + summernoteId).summernote('editor.focus');

                  var videoElement = document.createElement('video');
                  videoElement.controls = 'true';
                  videoElement.innerHTML = '<source ng-src="' + fullAssetPath + '" type="video/mp4">';
                  $('#' + summernoteId).summernote('insertNode', videoElement);
                }
              }
            }
          }
        }
      }

      _this.$mdDialog.hide();
    });

    /*
     * Listen for the siblingComponentStudentDataChanged event which occurs
     * when the student data has changed for another component in this step
     */
    this.$scope.$on('siblingComponentStudentDataChanged', function (event, args) {
      if (_this.nodeId == args.nodeId && _this.componentId != args.componentId) {
        var message = {};
        message.messageType = 'siblingComponentStudentDataChanged';
        message.componentState = args.componentState;
        _this.sendMessageToApplication(message);
      }
    });

    /* TODO geoffreykwan we're listening to assetSelected twice?
     * Listen for the assetSelected event which occurs when the user
     * selects an asset from the choose asset popup
     */
    this.$scope.$on('assetSelected', function (event, args) {
      if (args != null) {
        if (args.nodeId == _this.nodeId && args.componentId == _this.componentId) {
          var assetItem = args.assetItem;
          if (assetItem != null) {
            var fileName = assetItem.fileName;
            if (fileName != null) {
              if (args.target == 'modelFile') {
                _this.authoringComponentContent.url = fileName;
                _this.authoringViewComponentChanged();
              }
            }
          }
        }
      }
      _this.$mdDialog.hide();
    });

    /*
     * The advanced button for a component was clicked. If the button was
     * for this component, we will show the advanced authoring.
     */
    this.$scope.$on('componentAdvancedButtonClicked', function (event, args) {
      if (args != null) {
        var componentId = args.componentId;
        if (_this.componentId === componentId) {
          _this.showAdvancedAuthoring = !_this.showAdvancedAuthoring;
        }
      }
    });

    this.messageEventListener = angular.bind(this, function (messageEvent) {
      var messageEventData = messageEvent.data;
      if (messageEventData.messageType === 'event') {
        var nodeId = this.nodeId;
        var componentId = this.componentId;
        var componentType = this.componentType;
        var category = messageEventData.eventCategory;
        var event = messageEventData.event;
        var eventData = messageEventData.eventData;
        this.StudentDataService.saveVLEEvent(nodeId, componentId, componentType, category, event, eventData);
      } else if (messageEventData.messageType === 'studentWork') {
        if (messageEventData.id != null) {
          //the model wants to update/overwrite an existing component state
          this.componentStateId = messageEventData.id;
        } else {
          // the model wants to create a new component state
          this.componentStateId = null;
        }

        if (messageEventData.isSubmit) {
          this.isSubmit = messageEventData.isSubmit;
        }

        this.isDirty = true;
        this.setStudentData(messageEventData.studentData);
        this.studentDataChanged();

        // tell the parent node that this component wants to save
        this.$scope.$emit('componentSaveTriggered', { nodeId: this.nodeId, componentId: this.componentId });
      } else if (messageEventData.messageType === 'applicationInitialized') {
        this.sendLatestWorkToApplication();
        this.processLatestSubmit();

        // activate iframe-resizer on the embedded app's iframe
        $('#' + this.embeddedApplicationIFrameId).iFrameResize({ scrolling: true });
      } else if (messageEventData.messageType === 'componentDirty') {
        var _isDirty = messageEventData.isDirty;
        this.isDirty = _isDirty;
        this.$scope.$emit('componentDirty', { componentId: this.componentId, isDirty: _isDirty });
      } else if (messageEventData.messageType === 'componentSubmitDirty') {
        var isSubmitDirty = messageEventData.isDirty;
        this.isSubmitDirty = isSubmitDirty;
        this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: isDirty });
      } else if (messageEventData.messageType === 'studentDataChanged') {
        this.setStudentData(messageEventData.studentData);
        this.studentDataChanged();
      } else if (messageEventData.messageType === 'getStudentWork') {
        var getStudentWorkParams = messageEventData.getStudentWorkParams;
        var studentWork = this.getStudentWork(messageEventData.getStudentWorkParams);
        var message = studentWork;
        message.messageType = 'studentWork';
        message.getStudentWorkParams = getStudentWorkParams;
        this.sendMessageToApplication(message);
      } else if (messageEventData.messageType === 'getLatestStudentWork') {
        var latestComponentState = this.getLatestStudentWork();
        var message = {};
        message.messageType = 'latestStudentWork';
        message.latestStudentWork = latestComponentState;
        this.sendMessageToApplication(message);
      } else if (messageEventData.messageType === 'getParameters') {
        var message = {};
        message.messageType = 'parameters';
        var parameters = {};
        if (this.componentContent.parameters != null) {
          parameters = this.UtilService.makeCopyOfJSONObject(this.componentContent.parameters);
        }
        parameters.nodeId = this.nodeId;
        parameters.componentId = this.componentId;
        message.parameters = parameters;
        this.sendMessageToApplication(message);
      }
    });
  }

  _createClass(EmbeddedController, [{
    key: 'iframeLoaded',
    value: function iframeLoaded(contentLocation) {
      window.document.getElementById(this.embeddedApplicationIFrameId).contentWindow.addEventListener('message', this.messageEventListener);
    }

    /**
     * Check if latest component state is a submission and if not, set isSubmitDirty to true
     */

  }, {
    key: 'processLatestSubmit',
    value: function processLatestSubmit() {
      var latestState = this.$scope.componentState;
      if (latestState) {
        var serverSaveTime = latestState.serverSaveTime;
        var clientSaveTime = this.ConfigService.convertToClientTimestamp(serverSaveTime);
        if (latestState.isSubmit) {
          this.isSubmitDirty = false;
          this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: false });
          this.setSaveMessage(this.$translate('LAST_SUBMITTED'), clientSaveTime);
        } else {
          this.isSubmitDirty = true;
          this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: true });
          this.setSaveMessage(this.$translate('LAST_SAVED'), clientSaveTime);
        }
      }
    }
  }, {
    key: 'setURL',
    value: function setURL(url) {
      if (url != null) {
        this.url = this.$sce.trustAsResourceUrl(url);
      }
    }
  }, {
    key: 'submit',
    value: function submit() {
      if (this.isLockAfterSubmit()) {
        this.isDisabled = true;
      }
    }
  }, {
    key: 'studentDataChanged',


    /**
     * Called when the student changes their work
     */
    value: function studentDataChanged() {
      var _this2 = this;

      /*
       * set the dirty flags so we will know we need to save or submit the
       * student work later
       */
      this.isDirty = true;
      this.$scope.$emit('componentDirty', { componentId: this.componentId, isDirty: true });

      this.isSubmitDirty = true;
      this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: true });

      this.setSaveMessage('', null);
      var componentId = this.getComponentId();

      /*
       * the student work in this component has changed so we will tell
       * the parent node that the student data will need to be saved.
       * this will also notify connected parts that this component's student
       * data has changed.
       */
      var action = 'change';

      this.createComponentState(action).then(function (componentState) {
        _this2.$scope.$emit('componentStudentDataChanged', { nodeId: _this2.nodeId, componentId: componentId, componentState: componentState });
      });
    }
  }, {
    key: 'createComponentState',


    /**
     * Create a new component state populated with the student data
     * @return the componentState after it has been populated
     */
    value: function createComponentState(action) {
      var componentState = this.NodeService.createNewComponentState();

      if (this.componentStateId != null) {
        componentState.id = this.componentStateId;
      }

      if (this.isSubmit) {
        componentState.isSubmit = this.isSubmit;

        /*
         * reset the isSubmit value so that the next component state
         * doesn't maintain the same value
         */
        this.isSubmit = false;
      }

      componentState.studentData = this.studentData;
      componentState.componentType = 'Embedded';
      componentState.nodeId = this.nodeId;
      componentState.componentId = this.componentId;

      var deferred = this.$q.defer();

      /*
       * perform any additional processing that is required before returning
       * the component state
       */
      this.createComponentStateAdditionalProcessing(deferred, componentState, action);
      return deferred.promise;
    }
  }, {
    key: 'createComponentStateAdditionalProcessing',


    /**
     * Perform any additional processing that is required before returning the
     * component state
     * Note: this function must call deferred.resolve() otherwise student work
     * will not be saved
     * @param deferred a deferred object
     * @param componentState the component state
     * @param action the action that we are creating the component state for
     * e.g. 'submit', 'save', 'change'
     */
    value: function createComponentStateAdditionalProcessing(deferred, componentState, action) {
      /*
       * we don't need to perform any additional processing so we can resolve
       * the promise immediately
       */
      deferred.resolve(componentState);
    }
  }, {
    key: 'sendLatestWorkToApplication',
    value: function sendLatestWorkToApplication() {
      var componentState = this.$scope.componentState;
      if (this.UtilService.hasConnectedComponent(this.componentContent)) {
        componentState = this.handleConnectedComponents();
      }
      var message = {
        messageType: 'componentState',
        componentState: componentState
      };

      this.sendMessageToApplication(message);
    }
  }, {
    key: 'sendMessageToApplication',
    value: function sendMessageToApplication(message) {
      window.document.getElementById(this.embeddedApplicationIFrameId).contentWindow.postMessage(message, '*');
    }
  }, {
    key: 'setSaveMessage',


    /**
     * Set the message next to the save button
     * @param message the message to display
     * @param time the time to display
     */
    value: function setSaveMessage(message, time) {
      this.saveMessage.text = message;
      this.saveMessage.time = time;
    }
  }, {
    key: 'getComponentId',


    /**
     * Get the component id
     * @return the component id
     */
    value: function getComponentId() {
      return this.componentContent.id;
    }
  }, {
    key: 'authoringViewComponentChanged',


    /**
     * The component has changed in the regular authoring view so we will save the project
     */
    value: function authoringViewComponentChanged() {
      this.updateAdvancedAuthoringView();

      /*
       * notify the parent node that the content has changed which will save
       * the project to the server
       */
      this.$scope.$parent.nodeAuthoringController.authoringViewNodeChanged();
    }
  }, {
    key: 'advancedAuthoringViewComponentChanged',


    /**
     * The component has changed in the advanced authoring view so we will update
     * the component and save the project.
     */
    value: function advancedAuthoringViewComponentChanged() {
      try {
        /*
         * create a new component by converting the JSON string in the advanced
         * authoring view into a JSON object
         */
        var editedComponentContent = angular.fromJson(this.authoringComponentContentJSONString);

        this.ProjectService.replaceComponent(this.nodeId, this.componentId, editedComponentContent);

        this.componentContent = editedComponentContent;

        /*
         * notify the parent node that the content has changed which will save
         * the project to the server
         */
        this.$scope.$parent.nodeAuthoringController.authoringViewNodeChanged();
      } catch (e) {
        this.$scope.$parent.nodeAuthoringController.showSaveErrorAdvancedAuthoring();
      }
    }
  }, {
    key: 'updateAdvancedAuthoringView',


    /**
     * Update the component JSON string that will be displayed in the advanced authoring view textarea
     */
    value: function updateAdvancedAuthoringView() {
      this.authoringComponentContentJSONString = angular.toJson(this.authoringComponentContent, 4);
    }
  }, {
    key: 'snipModel',


    /**
     * Snip the model by converting it to an image
     * @param $event the click event
     */
    value: function snipModel($event) {
      var _this3 = this;

      var iframe = $('#' + this.embeddedApplicationIFrameId);
      if (iframe != null && iframe.length > 0) {
        var modelElement = iframe.contents().find('html');
        if (modelElement != null && modelElement.length > 0) {
          modelElement = modelElement[0];

          // convert the model element to a canvas element
          (0, _html2canvas2.default)(modelElement).then(function (canvas) {
            var img_b64 = canvas.toDataURL('image/png');
            var imageObject = _this3.UtilService.getImageObjectFromBase64String(img_b64);
            _this3.NotebookService.addNewItem($event, imageObject);
          });
        }
      }
    }

    /**
     * Check whether we need to show the snip model button
     * @return whether to show the snip model button
     */

  }, {
    key: 'showSnipModelButton',
    value: function showSnipModelButton() {
      return this.NotebookService.isNotebookEnabled() && this.isSnipModelButtonVisible;
    }

    /**
     * Register the the listener that will listen for the exit event
     * so that we can perform saving before exiting.
     */

  }, {
    key: 'registerExitListener',
    value: function registerExitListener() {
      /*
       * Listen for the 'exit' event which is fired when the student exits
       * the VLE. This will perform saving before the VLE exits.
       */
      this.exitListener = this.$scope.$on('exit', angular.bind(this, function (event, args) {}));
    }
  }, {
    key: 'isApplicationNode',


    /**
     * Check if a node is a step node
     * @param nodeId the node id to check
     * @returns whether the node is an application node
     */
    value: function isApplicationNode(nodeId) {
      return this.ProjectService.isApplicationNode(nodeId);
    }
  }, {
    key: 'getNodePositionAndTitleByNodeId',
    value: function getNodePositionAndTitleByNodeId(nodeId) {
      return this.ProjectService.getNodePositionAndTitleByNodeId(nodeId);
    }
  }, {
    key: 'getComponentsByNodeId',
    value: function getComponentsByNodeId(nodeId) {
      return this.ProjectService.getComponentsByNodeId(nodeId);
    }
  }, {
    key: 'authoringShowPreviousWorkClicked',
    value: function authoringShowPreviousWorkClicked() {
      if (!this.authoringComponentContent.showPreviousWork) {
        /*
         * show previous work has been turned off so we will clear the
         * show previous work node id, show previous work component id, and
         * show previous work prompt values
         */
        this.authoringComponentContent.showPreviousWorkNodeId = null;
        this.authoringComponentContent.showPreviousWorkComponentId = null;
        this.authoringComponentContent.showPreviousWorkPrompt = null;

        this.authoringViewComponentChanged();
      }
    }
  }, {
    key: 'authoringShowPreviousWorkNodeIdChanged',
    value: function authoringShowPreviousWorkNodeIdChanged() {
      if (this.authoringComponentContent.showPreviousWorkNodeId == null || this.authoringComponentContent.showPreviousWorkNodeId == '') {
        /*
         * the show previous work node id is null so we will also set the
         * show previous component id to null
         */
        this.authoringComponentContent.showPreviousWorkComponentId = '';
      }
      this.authoringViewComponentChanged();
    }
  }, {
    key: 'authoringShowPreviousWorkComponentIdChanged',
    value: function authoringShowPreviousWorkComponentIdChanged() {
      var showPreviousWorkNodeId = this.authoringComponentContent.showPreviousWorkNodeId;
      var showPreviousWorkPrompt = this.authoringComponentContent.showPreviousWorkPrompt;
      var oldShowPreviousWorkComponentId = this.componentContent.showPreviousWorkComponentId;
      var newShowPreviousWorkComponentId = this.authoringComponentContent.showPreviousWorkComponentId;
      var newShowPreviousWorkComponent = this.ProjectService.getComponentByNodeIdAndComponentId(showPreviousWorkNodeId, newShowPreviousWorkComponentId);

      if (newShowPreviousWorkComponent == null || newShowPreviousWorkComponent == '') {
        // save the component
        this.authoringViewComponentChanged();
      } else if (newShowPreviousWorkComponent != null) {
        var currentComponentType = this.componentContent.type;
        var newComponentType = newShowPreviousWorkComponent.type;
        if (newComponentType != currentComponentType) {
          /*
           * the component types are different so we will need to change
           * the whole component
           */

          if (confirm(this.$translate('ARE_YOU_SURE_YOU_WANT_TO_CHANGE_THIS_COMPONENT_TYPE'))) {
            /*
             * get the component service so we can make a new instance
             * of the component
             */
            var componentService = this.$injector.get(newComponentType + 'Service');
            if (componentService != null) {
              var newComponent = componentService.createComponent();
              newComponent.id = this.authoringComponentContent.id;
              newComponent.showPreviousWork = true;
              newComponent.showPreviousWorkNodeId = showPreviousWorkNodeId;
              newComponent.showPreviousWorkComponentId = newShowPreviousWorkComponentId;
              newComponent.showPreviousWorkPrompt = showPreviousWorkPrompt;

              /*
               * update the authoring component content JSON string to
               * change the component
               */
              this.authoringComponentContentJSONString = JSON.stringify(newComponent);
              this.advancedAuthoringViewComponentChanged();
            }
          } else {
            /*
             * the author does not want to change the component type so
             * we will rollback the showPreviousWorkComponentId value
             */
            this.authoringComponentContent.showPreviousWorkComponentId = oldShowPreviousWorkComponentId;
          }
        } else {
          /*
           * the component types are the same so we do not need to change
           * the component type and can just save
           */
          this.authoringViewComponentChanged();
        }
      }
    }
  }, {
    key: 'componentHasWork',
    value: function componentHasWork(component) {
      if (component != null) {
        return this.ProjectService.componentHasWork(component);
      }
      return true;
    }
  }, {
    key: 'isLockAfterSubmit',
    value: function isLockAfterSubmit() {
      if (this.componentContent != null) {
        if (this.componentContent.lockAfterSubmit) {
          return true;
        }
      }
      return false;
    }
  }, {
    key: 'saveButtonClicked',
    value: function saveButtonClicked() {
      this.isSubmit = false;
      this.$scope.$emit('componentSaveTriggered', { nodeId: this.nodeId, componentId: this.componentId });
    }
  }, {
    key: 'submitButtonClicked',
    value: function submitButtonClicked() {
      this.isSubmit = true;
      this.$scope.$emit('componentSubmitTriggered', { nodeId: this.nodeId, componentId: this.componentId });
    }
  }, {
    key: 'getLatestStudentWork',
    value: function getLatestStudentWork() {
      return this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);
    }

    /**
     * Get the student work from the specified components/nodes
     * @param params The params for getting the student work. The possible
     * values to request are
     * getLatestStudentWorkFromThisComponent
     * getAllStudentWorkFromThisComponent
     * getLatestStudentWorkFromThisNode
     * getAllStudentWorkFromThisNode
     * getLatestStudentWorkFromOtherComponents
     * getAllStudentWorkFromOtherComponents
     * If getLatestStudentWorkFromOtherComponents or getAllStudentWorkFromOtherComponents
     * are requested, the otherComponents param must be provided. otherComponents
     * should be an array of objects. The objects should contain a nodeId and
     * componentId.
     * @return an object containing other objects that contain work from the
     * specified components/nodes
     */

  }, {
    key: 'getStudentWork',
    value: function getStudentWork(params) {
      var studentWork = {};

      if (params != null && params.getLatestStudentWorkFromThisComponent) {
        studentWork.latestStudentWorkFromThisComponent = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);
      }

      if (params != null && params.getAllStudentWorkFromThisComponent) {
        studentWork.allStudentWorkFromThisComponent = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(this.nodeId, this.componentId);
      }

      if (params != null && params.getLatestStudentWorkFromThisNode) {
        studentWork.latestStudentWorkFromThisNode = this.StudentDataService.getLatestComponentStatesByNodeId(this.nodeId);
      }

      if (params != null && params.getAllStudentWorkFromThisNode) {
        studentWork.allStudentWorkFromThisNode = this.StudentDataService.getComponentStatesByNodeId(this.nodeId);
      }

      if (params != null && params.getLatestStudentWorkFromOtherComponents) {
        // an array of objects that contain a nodeId and component Id
        var otherComponents = params.otherComponents;
        var latestStudentWorkFromOtherComponents = [];
        if (otherComponents != null) {
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = otherComponents[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var otherComponent = _step.value;

              if (otherComponent != null) {
                var tempNodeId = otherComponent.nodeId;
                var tempComponentId = otherComponent.componentId;

                if (tempNodeId != null && tempComponentId != null) {
                  var tempComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(tempNodeId, tempComponentId);
                  if (tempComponentState != null) {
                    latestStudentWorkFromOtherComponents.push(tempComponentState);
                  }
                }
              }
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }
        }
        studentWork.latestStudentWorkFromOtherComponents = latestStudentWorkFromOtherComponents;
      }

      if (params != null && params.getAllStudentWorkFromOtherComponents) {
        var otherComponents = params.otherComponents;
        var allStudentWorkFromOtherComponents = [];
        if (otherComponents != null) {
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = otherComponents[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var otherComponent = _step2.value;

              if (otherComponent != null) {
                var tempNodeId = otherComponent.nodeId;
                var tempComponentId = otherComponent.componentId;
                if (tempNodeId != null && tempComponentId != null) {
                  var tempComponentStates = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(tempNodeId, tempComponentId);
                  if (tempComponentStates != null && tempComponentStates.length > 0) {
                    allStudentWorkFromOtherComponents = allStudentWorkFromOtherComponents.concat(tempComponentStates);
                  }
                }
              }
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }
        }
        studentWork.allStudentWorkFromOtherComponents = allStudentWorkFromOtherComponents;
      }
      return studentWork;
    }
  }, {
    key: 'authoringImportPreviousWorkClicked',
    value: function authoringImportPreviousWorkClicked() {
      if (!this.authoringComponentContent.importPreviousWork) {
        /*
         * import previous work has been turned off so we will clear the
         * import previous work node id, and import previous work
         * component id
         */
        this.authoringComponentContent.importPreviousWorkNodeId = null;
        this.authoringComponentContent.importPreviousWorkComponentId = null;

        this.authoringViewComponentChanged();
      }
    }
  }, {
    key: 'authoringImportPreviousWorkNodeIdChanged',
    value: function authoringImportPreviousWorkNodeIdChanged() {
      if (this.authoringComponentContent.importPreviousWorkNodeId == null || this.authoringComponentContent.importPreviousWorkNodeId == '') {
        /*
         * the import previous work node id is null so we will also set the
         * import previous component id to null
         */
        this.authoringComponentContent.importPreviousWorkComponentId = '';
      }

      this.authoringViewComponentChanged();
    }
  }, {
    key: 'authoringImportPreviousWorkComponentIdChanged',
    value: function authoringImportPreviousWorkComponentIdChanged() {
      this.authoringViewComponentChanged();
    }
  }, {
    key: 'summernoteRubricHTMLChanged',
    value: function summernoteRubricHTMLChanged() {
      var html = this.summernoteRubricHTML;

      /*
       * remove the absolute asset paths
       * e.g.
       * <img src='https://wise.berkeley.edu/curriculum/3/assets/sun.png'/>
       * will be changed to
       * <img src='sun.png'/>
       */
      html = this.ConfigService.removeAbsoluteAssetPaths(html);

      /*
       * replace <a> and <button> elements with <wiselink> elements when
       * applicable
       */
      html = this.UtilService.insertWISELinks(html);

      this.authoringComponentContent.rubric = html;
      this.authoringViewComponentChanged();
    }
  }, {
    key: 'addConnectedComponent',
    value: function addConnectedComponent() {
      var newConnectedComponent = {};
      newConnectedComponent.nodeId = this.nodeId;
      newConnectedComponent.componentId = null;
      newConnectedComponent.updateOn = 'change';
      if (this.authoringComponentContent.connectedComponents == null) {
        this.authoringComponentContent.connectedComponents = [];
      }
      this.authoringComponentContent.connectedComponents.push(newConnectedComponent);
      this.authoringViewComponentChanged();
    }
  }, {
    key: 'deleteConnectedComponent',
    value: function deleteConnectedComponent(indexOfComponentToDelete) {
      if (this.authoringComponentContent.connectedComponents != null) {
        this.authoringComponentContent.connectedComponents.splice(indexOfComponentToDelete, 1);
      }
      this.authoringViewComponentChanged();
    }
  }, {
    key: 'setShowSubmitButtonValue',
    value: function setShowSubmitButtonValue(show) {
      if (show == null || show == false) {
        this.authoringComponentContent.showSaveButton = false;
        this.authoringComponentContent.showSubmitButton = false;
      } else {
        this.authoringComponentContent.showSaveButton = true;
        this.authoringComponentContent.showSubmitButton = true;
      }

      /*
       * notify the parent node that this component is changing its
       * showSubmitButton value so that it can show save buttons on the
       * step or sibling components accordingly
       */
      this.$scope.$emit('componentShowSubmitButtonValueChanged', { nodeId: this.nodeId, componentId: this.componentId, showSubmitButton: show });
    }
  }, {
    key: 'showSubmitButtonValueChanged',
    value: function showSubmitButtonValueChanged() {
      /*
       * perform additional processing for when we change the showSubmitButton
       * value
       */
      this.setShowSubmitButtonValue(this.authoringComponentContent.showSubmitButton);
      this.authoringViewComponentChanged();
    }

    /**
     * Show the asset popup to allow the author to choose the model file
     */

  }, {
    key: 'chooseModelFile',
    value: function chooseModelFile() {
      var params = {};
      params.isPopup = true;
      params.nodeId = this.nodeId;
      params.componentId = this.componentId;
      params.target = 'modelFile';
      this.$rootScope.$broadcast('openAssetChooser', params);
    }
  }, {
    key: 'addTag',
    value: function addTag() {
      if (this.authoringComponentContent.tags == null) {
        this.authoringComponentContent.tags = [];
      }
      this.authoringComponentContent.tags.push('');
      this.authoringViewComponentChanged();
    }

    /**
     * Move a tag up
     * @param index the index of the tag to move up
     */

  }, {
    key: 'moveTagUp',
    value: function moveTagUp(index) {
      if (index > 0) {
        // the index is not at the top so we can move it up
        var tag = this.authoringComponentContent.tags[index];
        this.authoringComponentContent.tags.splice(index, 1);
        this.authoringComponentContent.tags.splice(index - 1, 0, tag);
      }
      this.authoringViewComponentChanged();
    }

    /**
     * Move a tag down
     * @param index the index of the tag to move down
     */

  }, {
    key: 'moveTagDown',
    value: function moveTagDown(index) {
      if (index < this.authoringComponentContent.tags.length - 1) {
        // the index is not at the bottom so we can move it down
        var tag = this.authoringComponentContent.tags[index];
        this.authoringComponentContent.tags.splice(index, 1);
        this.authoringComponentContent.tags.splice(index + 1, 0, tag);
      }
      this.authoringViewComponentChanged();
    }
  }, {
    key: 'deleteTag',
    value: function deleteTag(indexOfTagToDelete) {
      if (confirm(this.$translate('areYouSureYouWantToDeleteThisTag'))) {
        this.authoringComponentContent.tags.splice(indexOfTagToDelete, 1);
      }
      this.authoringViewComponentChanged();
    }

    /**
     * Import any work we need from connected components
     */

  }, {
    key: 'handleConnectedComponents',
    value: function handleConnectedComponents() {
      var mergedComponentState = this.$scope.componentState;
      var firstTime = true;
      if (mergedComponentState == null) {
        mergedComponentState = this.NodeService.createNewComponentState();
        mergedComponentState.studentData = {};
      } else {
        firstTime = false;
      }
      var connectedComponents = this.componentContent.connectedComponents;
      if (connectedComponents != null) {
        var componentStates = [];
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = connectedComponents[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var connectedComponent = _step3.value;

            if (connectedComponent != null) {
              var nodeId = connectedComponent.nodeId;
              var componentId = connectedComponent.componentId;
              var type = connectedComponent.type;
              var mergeFields = connectedComponent.mergeFields;
              if (type == 'showWork') {
                var componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId);
                if (componentState != null) {
                  componentStates.push(this.UtilService.makeCopyOfJSONObject(componentState));
                }
                // we are showing work so we will not allow the student to edit it
                this.isDisabled = true;
              } else if (type == 'importWork' || type == null) {
                var connectedComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId);
                if (connectedComponentState != null) {
                  var fields = connectedComponent.fields;
                  mergedComponentState = this.mergeComponentState(mergedComponentState, connectedComponentState, fields, firstTime);
                }
              }
            }
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }

        if (mergedComponentState != null) {
          this.setStudentWork(mergedComponentState);
          this.studentDataChanged();
        }
      }
      return mergedComponentState;
    }

    /**
     * Merge a new component state into a base component state.
     * @param baseComponentState The component state we will be merging into.
     * @param newComponentState The component state we will be merging from.
     * @param mergeFields The fields to merge.
     * @param firstTime Whether this is the first time the baseComponentState is
     * being merged into.
     */

  }, {
    key: 'mergeComponentState',
    value: function mergeComponentState(baseComponentState, newComponentState, mergeFields, firstTime) {
      if (mergeFields == null) {
        if (newComponentState.componentType == 'Embedded') {
          // there are no merge fields specified so we will get all of the fields
          baseComponentState.studentData = this.UtilService.makeCopyOfJSONObject(newComponentState.studentData);
        }
      } else {
        // we will merge specific fields
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = mergeFields[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var mergeField = _step4.value;

            var name = mergeField.name;
            var when = mergeField.when;
            var action = mergeField.action;
            if (when == 'firstTime' && firstTime == true) {
              if (action == 'write') {
                baseComponentState.studentData[name] = newComponentState.studentData[name];
              } else if (action == 'read') {
                // TODO
              }
            } else if (when == 'always') {
              if (action == 'write') {
                baseComponentState.studentData[name] = newComponentState.studentData[name];
              } else if (action == 'read') {
                // TODO
              }
            }
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
              _iterator4.return();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
        }
      }
      return baseComponentState;
    }

    /**
     * Populate the student work into the component
     * @param componentState the component state to populate into the component
     */

  }, {
    key: 'setStudentWork',
    value: function setStudentWork(componentState) {
      this.studentData = componentState.studentData;
    }
  }, {
    key: 'setStudentData',


    /**
     * Populate the student work into the component
     * @param componentState the component state to populate into the component
     */
    value: function setStudentData(studentData) {
      this.studentData = studentData;
    }
  }, {
    key: 'authoringAddConnectedComponent',
    value: function authoringAddConnectedComponent() {
      /*
       * create the new connected component object that will contain a
       * node id and component id
       */
      var newConnectedComponent = {};
      newConnectedComponent.nodeId = this.nodeId;
      newConnectedComponent.componentId = null;
      newConnectedComponent.type = null;
      this.authoringAutomaticallySetConnectedComponentComponentIdIfPossible(newConnectedComponent);

      if (this.authoringComponentContent.connectedComponents == null) {
        this.authoringComponentContent.connectedComponents = [];
      }
      this.authoringComponentContent.connectedComponents.push(newConnectedComponent);
      this.authoringViewComponentChanged();
    }

    /**
     * Automatically set the component id for the connected component if there
     * is only one viable option.
     * @param connectedComponent the connected component object we are authoring
     */

  }, {
    key: 'authoringAutomaticallySetConnectedComponentComponentIdIfPossible',
    value: function authoringAutomaticallySetConnectedComponentComponentIdIfPossible(connectedComponent) {
      if (connectedComponent != null) {
        var components = this.getComponentsByNodeId(connectedComponent.nodeId);
        if (components != null) {
          var numberOfAllowedComponents = 0;
          var allowedComponent = null;
          var _iteratorNormalCompletion5 = true;
          var _didIteratorError5 = false;
          var _iteratorError5 = undefined;

          try {
            for (var _iterator5 = components[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
              var component = _step5.value;

              if (component != null) {
                if (this.isConnectedComponentTypeAllowed(component.type) && component.id != this.componentId) {
                  // we have found a viable component we can connect to
                  numberOfAllowedComponents += 1;
                  allowedComponent = component;
                }
              }
            }
          } catch (err) {
            _didIteratorError5 = true;
            _iteratorError5 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion5 && _iterator5.return) {
                _iterator5.return();
              }
            } finally {
              if (_didIteratorError5) {
                throw _iteratorError5;
              }
            }
          }

          if (numberOfAllowedComponents == 1) {
            /*
             * there is only one viable component to connect to so we
             * will use it
             */
            connectedComponent.componentId = allowedComponent.id;
            connectedComponent.type = 'importWork';
          }
        }
      }
    }

    /**
     * Delete a connected component
     * @param index the index of the component to delete
     */

  }, {
    key: 'authoringDeleteConnectedComponent',
    value: function authoringDeleteConnectedComponent(index) {
      if (confirm(this.$translate('areYouSureYouWantToDeleteThisConnectedComponent'))) {
        if (this.authoringComponentContent.connectedComponents != null) {
          this.authoringComponentContent.connectedComponents.splice(index, 1);
        }
        this.authoringViewComponentChanged();
      }
    }

    /**
     * Get the connected component type
     * @param connectedComponent get the component type of this connected component
     * @return the connected component type
     */

  }, {
    key: 'authoringGetConnectedComponentType',
    value: function authoringGetConnectedComponentType(connectedComponent) {
      var connectedComponentType = null;
      if (connectedComponent != null) {
        var nodeId = connectedComponent.nodeId;
        var componentId = connectedComponent.componentId;
        var component = this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);

        if (component != null) {
          connectedComponentType = component.type;
        }
      }
      return connectedComponentType;
    }

    /**
     * The connected component node id has changed
     * @param connectedComponent the connected component that has changed
     */

  }, {
    key: 'authoringConnectedComponentNodeIdChanged',
    value: function authoringConnectedComponentNodeIdChanged(connectedComponent) {
      if (connectedComponent != null) {
        connectedComponent.componentId = null;
        connectedComponent.type = null;
        this.authoringAutomaticallySetConnectedComponentComponentIdIfPossible(connectedComponent);
        this.authoringViewComponentChanged();
      }
    }

    /**
     * The connected component component id has changed
     * @param connectedComponent the connected component that has changed
     */

  }, {
    key: 'authoringConnectedComponentComponentIdChanged',
    value: function authoringConnectedComponentComponentIdChanged(connectedComponent) {
      if (connectedComponent != null) {
        // default the type to import work
        connectedComponent.type = 'importWork';
        this.authoringViewComponentChanged();
      }
    }

    /**
     * The connected component type has changed
     * @param connectedComponent the connected component that changed
     */

  }, {
    key: 'authoringConnectedComponentTypeChanged',
    value: function authoringConnectedComponentTypeChanged(connectedComponent) {
      if (connectedComponent != null) {
        if (connectedComponent.type == 'importWork') {
          /*
           * the type has changed to import work
           */
        } else if (connectedComponent.type == 'showWork') {
          /*
           * the type has changed to show work
           */
        }
        this.authoringViewComponentChanged();
      }
    }

    /**
     * Check if we are allowed to connect to this component type
     * @param componentType the component type
     * @return whether we can connect to the component type
     */

  }, {
    key: 'isConnectedComponentTypeAllowed',
    value: function isConnectedComponentTypeAllowed(componentType) {
      if (componentType != null) {
        var allowedConnectedComponentTypes = this.allowedConnectedComponentTypes;
        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
          for (var _iterator6 = allowedConnectedComponentTypes[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var allowedConnectedComponentType = _step6.value;

            if (allowedConnectedComponentType != null) {
              if (componentType == allowedConnectedComponentType.type) {
                return true;
              }
            }
          }
        } catch (err) {
          _didIteratorError6 = true;
          _iteratorError6 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion6 && _iterator6.return) {
              _iterator6.return();
            }
          } finally {
            if (_didIteratorError6) {
              throw _iteratorError6;
            }
          }
        }
      }
      return false;
    }

    /**
     * The show JSON button was clicked to show or hide the JSON authoring
     */

  }, {
    key: 'showJSONButtonClicked',
    value: function showJSONButtonClicked() {
      this.showJSONAuthoring = !this.showJSONAuthoring;
      if (this.jsonStringChanged && !this.showJSONAuthoring) {
        /*
         * the author has changed the JSON and has just closed the JSON
         * authoring view so we will save the component
         */
        this.advancedAuthoringViewComponentChanged();

        this.$rootScope.$broadcast('scrollToComponent', { componentId: this.componentId });
        this.jsonStringChanged = false;
      }
    }

    /**
     * The author has changed the JSON manually in the advanced view
     */

  }, {
    key: 'authoringJSONChanged',
    value: function authoringJSONChanged() {
      this.jsonStringChanged = true;
    }
  }]);

  return EmbeddedController;
}();

EmbeddedController.$inject = ['$filter', '$injector', '$mdDialog', '$q', '$rootScope', '$scope', '$sce', '$timeout', '$window', 'AnnotationService', 'ConfigService', 'NodeService', 'NotebookService', 'EmbeddedService', 'ProjectService', 'StudentDataService', 'UtilService'];

exports.default = EmbeddedController;
//# sourceMappingURL=embeddedController.js.map
